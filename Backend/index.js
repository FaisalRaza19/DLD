import express from "express";
import session from "express-session";
import { connectToDb } from "./DataBase/db.js";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import MongoStore from "connect-mongo";

import { router as userRoutes } from "./Routes/user.route.js";
import { Case } from "./Routes/case.route.js";
import { subUser } from "./Routes/client_lawyer.route.js";
import { hearing } from "./Routes/hearing.route.js";

import agenda from "./utility/agenda.js";
import registerHearingJobs from "./utility/hearingJobs.js";

// Load environment variables from .env file
dotenv.config({ path: ".env" });

// Connect to MongoDB
connectToDb();

const app = express();
// Trust the reverse proxy
if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}
const server = http.createServer(app);

// Get allowed origins from environment variables.
const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map(o => o.trim()).filter(Boolean)
    : [];

// Socket.IO setup with CORS handling
const io = new Server(server, {
    cors: {
        origin: (origin, cb) => {
            if (!origin) return cb(null, true);
            const isAllowed = allowedOrigins.includes(origin);
            if (isAllowed || allowedOrigins.length === 0) {
                return cb(null, true);
            } else {
                return cb(new Error("Not allowed by CORS"));
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization", "token", "X-Requested-With"],
        credentials: true,
    },
});

// Attach io to request object for use in routes
app.use((req, res, next) => {
    req.app.set("io", io);
    next();
});

// Socket.IO authentication middleware
io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
        return next(new Error("Authentication error: No token provided"));
    }
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        socket.userId = decoded.id;
        next();
    } catch (err) {
        next(new Error("Authentication error: Invalid token"));
    }
});

// Socket.IO connection handling
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId}`);
    socket.join(`user:${socket.userId}`);

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.userId}`);
    });
});

// Express middleware
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// Express CORS setup
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const isAllowed = allowedOrigins.includes(origin);
        if (isAllowed || allowedOrigins.length === 0) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "token", "X-Requested-With"],
}));

// Session setup with MongoDB store for production
app.use(session({
    secret: process.env.SESSION_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.DB_URL,
        collectionName: "sessions",
        ttl: 10 * 60,
    }),
    cookie: {
        maxAge: 10 * 60 * 1000, // 10 minutes in milliseconds
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
}));

// Routes
app.get("/", (req, res) => res.status(200).json({ success: true, message: "Welcome to the API" }));
app.use("/user", userRoutes);
app.use("/case", Case);
app.use("/subUser", subUser);
app.use("/hearings", hearing);

// Start Agenda jobs
(async () => {
    try {
        await agenda.start();
        await registerHearingJobs(agenda, io);
        console.log("Agenda is running and jobs are registered");
    } catch (error) {
        console.error("Error starting agenda:", error);
    }
})();

// Start server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server is running on ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
});
