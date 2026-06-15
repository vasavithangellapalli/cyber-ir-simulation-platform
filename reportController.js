// ============================================
// controllers/reportController.js
// ============================================
// Returns the full final report for a user.
// Combines score + scenario details + action history.
// Powers the "Final Report" screen on the frontend.

const Score = require("../models/Score");
const Scenario = require("../models/Scenario");
const UserAction = require("../models/UserAction");

// ----------------------------------------
// GET /report/:userId
// Returns the full report for a user
// Optional query param: ?scenarioId=ransomware-001
// ----------------------------------------
const getReport = async (req, res) => {
  try {
    const { userId } = req.params;
    const { scenarioId } = req.query; // optional filter

    // --- Build filter ---
    const filter = { userId };
    if (scenarioId) filter.scenarioId = scenarioId;

    // --- Get all scores for this user ---
    const scores = await Score.find(filter).sort({ createdAt: -1 });

    if (!scores.length) {
      return res.status(404).json({
        success: false,
        message: "No report found. Complete a scenario first!",
      });
    }

    // --- Build detailed report for each score ---
    const reports = await Promise.all(
      scores.map(async (score) => {
        // Get scenario details
        const scenario = await Scenario.findOne({
          scenarioId: score.scenarioId,
        });

        // Get all actions the user took
        const actions = await UserAction.find({
          userId,
          scenarioId: score.scenarioId,
        }).sort({ createdAt: 1 });

        return {
          reportId: score._id,
          completedAt: score.updatedAt,

          // Scenario info
          scenario: scenario
            ? {
                title: scenario.title,
                type: scenario.type,
                severity: scenario.severity,
                description: scenario.description,
              }
            : null,

          // Overall score
          performance: {
            totalScore: score.totalScore,
            grade: score.grade,
            performanceLabel: score.performanceLabel,
          },

          // Category breakdown
          breakdown: {
            containmentScore: score.containmentScore,
            investigationScore: score.investigationScore,
            recoveryScore: score.recoveryScore,
          },

          // Time metrics (in minutes)
          metrics: {
            timeToDetect: score.timeToDetect,
            timeToContain: score.timeToContain,
            timeToEradicate: score.timeToEradicate,
            systemsAffected: score.systemsAffected,
          },

          // Action summary
          actionSummary: {
            total: score.actionsPerformed,
            correct: score.correctActions,
            incorrect: score.incorrectActions,
            accuracy: score.actionsPerformed
              ? Math.round((score.correctActions / score.actionsPerformed) * 100)
              : 0,
          },

          // Feedback
          feedback: {
            strengths: score.strengths,
            improvements: score.improvements,
            skillsDemonstrated: score.skillsDemonstrated,
          },

          // Full action log
          actionLog: actions.map((a) => ({
            time: a.simulationTime,
            label: a.actionLabel,
            category: a.category,
            isCorrect: a.isCorrect,
            points: a.pointsAwarded,
            feedback: a.feedback,
          })),
        };
      })
    );

    res.status(200).json({
      success: true,
      userId,
      totalReports: reports.length,
      data: reports,
    });
  } catch (error) {
    console.error("Report Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = { getReport };
