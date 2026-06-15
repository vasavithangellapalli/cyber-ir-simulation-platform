// ============================================
// controllers/dashboardController.js
// ============================================
// Controllers contain the actual logic for each API endpoint.
// The route file just maps the URL → controller function.

const Scenario = require("../models/Scenario");
const UserAction = require("../models/UserAction");
const Score = require("../models/Score");

// ----------------------------------------
// GET /dashboard
// Returns summary stats for the Dashboard screen
// ----------------------------------------
const getDashboardStats = async (req, res) => {
  try {
    // Count total scenarios in the DB
    const totalScenarios = await Scenario.countDocuments();

    // Count only active (ongoing) scenarios
    const activeScenarios = await Scenario.countDocuments({ status: "active" });

    // Count critical-severity scenarios
    const criticalAlerts = await Scenario.countDocuments({ severity: "critical" });

    // Count how many users have a score on file (= completed a scenario)
    const completedByUsers = await Score.countDocuments();

    // Get the 5 most recent scenarios to show in the "Recent Incidents" feed
    const recentIncidents = await Scenario.find()
      .sort({ createdAt: -1 }) // newest first
      .limit(5)
      .select("title type severity status createdAt"); // only return these fields

    // Build and send the response JSON
    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalScenarios,
          activeScenarios,
          criticalAlerts,
          completedByUsers,
          // Percentage of scenarios that are critical
          threatLevel: totalScenarios
            ? Math.round((criticalAlerts / totalScenarios) * 100)
            : 0,
        },
        recentIncidents,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = { getDashboardStats };
