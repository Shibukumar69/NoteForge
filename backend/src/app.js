import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.routes.js";
import lectureRoutes from "./routes/lecture.routes.js";
import notesRoutes from "./routes/notes.routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.resolve(__dirname, "../../uploads");
const GENERATED_DIR = path.resolve(__dirname, "../../generated");

const app = express();

// Security & Parsing Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(morgan("dev"));

// Serve uploaded and generated assets statically
app.use("/uploads", express.static(UPLOADS_DIR));
app.use("/generated", express.static(GENERATED_DIR));

// Health Route
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    service: "NoteForge AI Backend Orchestrator",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/lectures", lectureRoutes);
app.use("/api/notes", notesRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
