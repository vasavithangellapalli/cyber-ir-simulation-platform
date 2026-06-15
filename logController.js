// ============================================
// controllers/logController.js
// ============================================
// Handles fetching logs/timeline for a scenario.
// Powers the "Investigation" screen on the frontend.

const Log = require("../models/Log");

// ----------------------------------------
// GET /logs/:scenarioId
// Returns all log entries for a given scenario
// ----------------------------------------
const getLogsByScenario = async (req, res) => {
  try {
    const { scenarioId } = req.params;

    // Optional: filter by severity e.g. GET /logs/ransomware-001?severity=critical
    const filter = { scenarioId };
    if (req.query.severity) filter.severity = req.query.severity;
    if (req.query.category) filter.category = req.query.category;

    // Optional: filter evidence-only items
    if (req.query.evidenceOnly === "true") filter.isEvidence = true;

    // Fetch logs sorted by their simulation timestamp
    const logs = await Log.find(filter).sort({ timestamp: 1 });

    if (!logs.length) {
      return res.status(404).json({
        success: false,
        message: `No logs found for scenario: ${scenarioId}`,
      });
    }

    // Separate the evidence items for easy use on the frontend
    const evidence = logs.filter((l) => l.isEvidence);

    res.status(200).json({
      success: true,
      scenarioId,
      count: logs.length,
      evidenceCount: evidence.length,
      data: {
        timeline: logs,   // All logs in order (for the timeline panel)
        evidence,         // Key evidence items (for the evidence panel)
      },
    });
  } catch (error) {
    console.error("Get Logs Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = { getLogsByScenario };
