import express from "express";
import session from "express-session";
import { connectToDb } from "./DataBase/db.js";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import MongoStore from "conn"

import { router as userRoutes } from "./Routes/user.route.js";
import { Case } from "./Routes/case.route.js";
import { subUser } from "./Routes/client_lawyer.route.js";
import { hearing } from "./Routes/hearing.route.js";

import agenda from "./utility/agenda.js";
import registerHearingJobs from "./utility/hearingJobs.js";

dotenv.config({ path: ".env" });
connectToDb();

const app = express();
const server = http.createServer(app);

const allowedOrigins = process.env.CORS_ORIGINS.split(",").map(o => o.trim());

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization", "token", "X-Requested-With"],
        credentials: true,
        optionsSuccessStatus: 200,
    },
});

// Attach io for controllers
app.use((req, res, next) => {
    req.app.set("io", io);
    next();
});

// Middleware for token validation and socket connection
io.use(async (socket, next) => {
    const token = socket.handshake.query.token;
    if (!token) {
        return next(new Error("Authentication error: No token provided"));
    }
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        socket.userId = decoded?.id;
        next();
    } catch (err) {
        next(new Error("Authentication error: Invalid token"));
    }
});

// Socket rooms
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
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "token", "X-Requested-With"],
    credentials: true,
    optionsSuccessStatus: 200,
}));

app.use(session({
    secret: process.env.SESSION_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
    cookie: {
        maxAge: 10 * 60 * 1000,
        secure: process.env.NODE_ENV === "production",
    },
}));

// Routes
app.get("/", (req, res) => res.status(200).json({ success: true, message: "Welcome to the API" }));
app.use("/user", userRoutes);
app.use("/case", Case);
app.use("/subUser", subUser);
app.use("/hearings", hearing);

// Register and start agenda jobs
(async () => {
    try {
        await agenda.start();
        registerHearingJobs(agenda, io);
        console.log("Agenda is running");
    } catch (error) {
        console.error("Error starting agenda:", error);
    }
})();

const PORT = process.env.PORT || 8000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
server.listen(PORT, () => {
    console.log(`Server is running on ${BASE_URL}`);
});
