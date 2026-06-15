// ============================================
// controllers/scenarioController.js
// ============================================
// Handles everything related to Scenarios —
// listing them, and fetching one by ID.

const Scenario = require("../models/Scenario");

// ----------------------------------------
// GET /scenarios
// Returns all scenarios (for the Scenario Selection screen)
// ----------------------------------------
const getAllScenarios = async (req, res) => {
  try {
    // Optional: filter by type or severity using query params
    // e.g. GET /scenarios?type=ransomware or ?severity=critical
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.severity) filter.severity = req.query.severity;
    if (req.query.status) filter.status = req.query.status;

    const scenarios = await Scenario.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: scenarios.length,
      data: scenarios,
    });
  } catch (error) {
    console.error("Get Scenarios Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ----------------------------------------
// GET /scenarios/:scenarioId
// Returns a single scenario's full details
// ----------------------------------------
const getScenarioById = async (req, res) => {
  try {
    const scenario = await Scenario.findOne({
      scenarioId: req.params.scenarioId,
    });

    if (!scenario) {
      return res
        .status(404)
        .json({ success: false, message: "Scenario not found" });
    }

    res.status(200).json({ success: true, data: scenario });
  } catch (error) {
    console.error("Get Scenario Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = { getAllScenarios, getScenarioById };
