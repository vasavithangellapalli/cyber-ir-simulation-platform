// ============================================
// routes/index.js — All Routes (Central Router)
// ============================================
// This file maps URLs to controller functions.
// Think of routes as "menus" and controllers as "kitchen staff".

const express = require("express");
const router = express.Router();

// --- Import all controllers ---
const { getDashboardStats }   = require("../controllers/dashboardController");
const { getAllScenarios, getScenarioById } = require("../controllers/scenarioController");
const { getLogsByScenario }   = require("../controllers/logController");
const { getNetworkByScenario } = require("../controllers/networkController");
const { recordAction }        = require("../controllers/actionController");
const { calculateScore }      = require("../controllers/scoreController");
const { getReport }           = require("../controllers/reportController");

// ----------------------------------------
// DASHBOARD ROUTES
// Screen: Dashboard
// ----------------------------------------
// GET /api/dashboard → returns stats (active incidents, alerts, completions)
router.get("/dashboard", getDashboardStats);

// ----------------------------------------
// SCENARIO ROUTES
// Screen: Scenario Selection
// ----------------------------------------
// GET /api/scenarios       → list all scenarios
// GET /api/scenarios/:id  → single scenario detail
router.get("/scenarios", getAllScenarios);
router.get("/scenarios/:scenarioId", getScenarioById);

// ----------------------------------------
// LOG / TIMELINE ROUTES
// Screen: Investigation
// ----------------------------------------
// GET /api/logs/:scenarioId → timeline events for a scenario
router.get("/logs/:scenarioId", getLogsByScenario);

// ----------------------------------------
// NETWORK ROUTES
// Screen: Network Map
// ----------------------------------------
// GET /api/network/:scenarioId → nodes and connections
router.get("/network/:scenarioId", getNetworkByScenario);

// ----------------------------------------
// USER ACTION ROUTES
// Screen: Response Actions
// ----------------------------------------
// POST /api/action → record a user's response action
router.post("/action", recordAction);

// ----------------------------------------
// SCORE ROUTES
// Screen: Response Actions (on completion)
// ----------------------------------------
// POST /api/score → calculate final score from all actions
router.post("/score", calculateScore);

// ----------------------------------------
// REPORT ROUTES
// Screen: Final Report
// ----------------------------------------
// GET /api/report/:userId → full report for a user
// Optional: ?scenarioId=ransomware-001 to filter
router.get("/report/:userId", getReport);

module.exports = router;
