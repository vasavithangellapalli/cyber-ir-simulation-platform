// ============================================
// server.js — Main Entry Point
// ============================================
// This is where the Express server starts.
// It wires together: database, middleware, and routes.

// Load environment variables from .env file first
require("dotenv").config();

const express = require("express");
const cors    = require("cors");
const connectDB = require("./config/db");
const routes  = require("./routes/index");

// --- Create the Express app ---
const app = express();

// --- Connect to MongoDB ---
connectDB();

// ============================================
// MIDDLEWARE
// Middleware runs on EVERY request before routes.
// ============================================

// CORS: Allow your frontend (running on a different port) to talk to this server
// In development, we allow all origins. In production, restrict to your domain.
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body Parser: Allow Express to read JSON from request bodies (POST requests)
app.use(express.json());

// Logger: Print each request to the console so you can see what's happening
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next(); // Move on to the route handler
});

// ============================================
// ROUTES
// All API routes are prefixed with /api
// Example: GET /api/dashboard
// ============================================
app.use("/api", routes);

// ============================================
// ROOT ROUTE — Health check
// Visit http://localhost:5000 to confirm the server is running
// ============================================
app.get("/", (req, res) => {
  res.json({
    message: "🔐 CyberIR Simulation Platform — Backend API",
    status: "running",
    version: "1.0.0",
    endpoints: {
      dashboard: "GET /api/dashboard",
      scenarios: "GET /api/scenarios",
      scenarioDetail: "GET /api/scenarios/:scenarioId",
      logs: "GET /api/logs/:scenarioId",
      network: "GET /api/network/:scenarioId",
      postAction: "POST /api/action",
      postScore: "POST /api/score",
      report: "GET /api/report/:userId",
    },
  });
});

// ============================================
// 404 HANDLER — Unknown routes
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.url}`,
  });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 CyberIR Backend running on http://localhost:${PORT}`);
  console.log(`📖 API Docs: http://localhost:${PORT}/\n`);
});
