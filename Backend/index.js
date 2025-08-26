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

dotenv.config({ path: ".env" });

// Connect to MongoDB
connectToDb();

const app = express();
if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1); // trust first proxy (Railway)
}
const server = http.createServer(app);

// Allowed CORS origins
const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",").map(o => o.trim()).filter(Boolean) : [];

// Socket.IO setup
const io = new Server(server, {
    cors: {
        origin: (origin, cb) => {
            if (!origin) return cb(null, true);
            return allowedOrigins.length === 0
                ? cb(null, true)
                : cb(null, allowedOrigins.includes(origin));
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization", "token", "X-Requested-With"],
        credentials: true,
    },
});


// Attach io to request object
app.use((req, res, next) => {
    req.app.set("io", io);
    next();
});

// Socket.IO authentication using JWT
io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error("Authentication error: No token provided"));
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

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.length === 0) return callback(null, true);
        return allowedOrigins.includes(origin) ? callback(null, true) : callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "token", "X-Requested-With"],
}));


// Session setup with MongoDB store (works on serverless)
app.use(session({
    secret: process.env.SESSION_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.DB_URL,
        collectionName: "sessions",
    }),
    cookie: {
        maxAge: 10 * 60 * 1000, // 10 minutes
        secure: process.env.NODE_ENV === "production", // only over HTTPS in prod
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
}));

// Routes
app.get("/", (req, res) => res.status(200).json({ success: true, message: "Welcome to the API" }));
app.use("/user", userRoutes);
app.use("/case", Case);
app.use("/subUser", subUser);
app.use("/hearings", hearing);

// Start agenda jobs
(async () => {
    try {
        await agenda.start();
        registerHearingJobs(agenda, io);
        console.log("Agenda is running");
    } catch (error) {
        console.error("Error starting agenda:", error);
    }
})();

// Start server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server is running on ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
});
