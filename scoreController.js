// ============================================
// controllers/scoreController.js
// ============================================
// Calculates and saves the final score for a user
// after they complete a scenario.

const UserAction = require("../models/UserAction");
const Score = require("../models/Score");

// Helper: assign a letter grade based on percentage
const getGrade = (pct) => {
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C";
  if (pct >= 50) return "D";
  return "F";
};

// Helper: assign a performance label
const getPerformanceLabel = (pct) => {
  if (pct >= 90) return "Elite Responder";
  if (pct >= 80) return "Excellent Response";
  if (pct >= 70) return "Good Performance";
  if (pct >= 60) return "Satisfactory";
  if (pct >= 50) return "Needs Improvement";
  return "Critical Gaps Identified";
};

// ----------------------------------------
// POST /score
// Body: { userId, scenarioId, timeToDetect, timeToContain, timeToEradicate, systemsAffected }
// Aggregates the user's actions and calculates the final score.
// ----------------------------------------
const calculateScore = async (req, res) => {
  try {
    const {
      userId,
      scenarioId,
      timeToDetect = 15,
      timeToContain = 10,
      timeToEradicate = 30,
      systemsAffected = 1,
    } = req.body;

    if (!userId || !scenarioId) {
      return res.status(400).json({
        success: false,
        message: "userId and scenarioId are required",
      });
    }

    // --- Fetch all actions this user took in this scenario ---
    const actions = await UserAction.find({ userId, scenarioId });

    if (!actions.length) {
      return res.status(400).json({
        success: false,
        message: "No actions found. Please perform some actions before scoring.",
      });
    }

    // --- Tally up stats ---
    const correctActions = actions.filter((a) => a.isCorrect);
    const incorrectActions = actions.filter((a) => !a.isCorrect);

    // Sum points from each category
    const rawPoints = actions.reduce((sum, a) => sum + a.pointsAwarded, 0);

    // Max possible points = correct actions × average points per action
    const maxRawPoints = 100;

    // Clamp score between 0 and 100
    const totalScore = Math.min(100, Math.max(0, rawPoints));

    // --- Category breakdown scores (0-100 each) ---
    const containmentActions = actions.filter((a) => a.category === "containment");
    const investigationActions = actions.filter((a) => a.category === "investigation");
    const recoveryActions = actions.filter((a) => a.category === "recovery");

    const calcCategoryScore = (acts) => {
      if (!acts.length) return 0;
      const earned = acts.filter((a) => a.isCorrect).length;
      return Math.round((earned / acts.length) * 100);
    };

    // --- Build feedback based on score ---
    const strengths = [];
    const improvements = [];
    const skillsDemonstrated = [];

    if (correctActions.some((a) => a.category === "containment")) {
      strengths.push("Effective network isolation prevented further spread");
      skillsDemonstrated.push("Containment Strategy");
    }
    if (correctActions.some((a) => a.category === "investigation")) {
      strengths.push("Proper evidence preservation for forensic analysis");
      skillsDemonstrated.push("Log Analysis");
      skillsDemonstrated.push("Network Forensics");
    }
    if (correctActions.some((a) => a.category === "recovery")) {
      strengths.push("Systematic recovery approach minimised downtime");
      skillsDemonstrated.push("Incident Recovery");
    }
    if (timeToDetect < 15) {
      strengths.push(`Fast detection time of ${timeToDetect} minutes`);
    }

    if (incorrectActions.length > 0) {
      improvements.push(`Avoided ${incorrectActions.length} incorrect action(s) next time`);
    }
    if (timeToContain > 20) {
      improvements.push("Work on faster containment — aim for under 20 minutes");
    }
    if (containmentActions.length === 0) {
      improvements.push("Practice containment actions: isolating systems, blocking IPs");
    }

    if (skillsDemonstrated.length === 0) {
      skillsDemonstrated.push("Incident Awareness");
    }

    // --- Save to DB (upsert = update if exists, create if not) ---
    const score = await Score.findOneAndUpdate(
      { userId, scenarioId },
      {
        totalScore,
        maxScore: 100,
        grade: getGrade(totalScore),
        performanceLabel: getPerformanceLabel(totalScore),
        containmentScore: calcCategoryScore(containmentActions),
        investigationScore: calcCategoryScore(investigationActions),
        recoveryScore: calcCategoryScore(recoveryActions),
        timeToDetect,
        timeToContain,
        timeToEradicate,
        systemsAffected,
        actionsPerformed: actions.length,
        correctActions: correctActions.length,
        incorrectActions: incorrectActions.length,
        strengths,
        improvements,
        skillsDemonstrated,
      },
      { new: true, upsert: true } // upsert: create document if it doesn't exist
    );

    res.status(200).json({
      success: true,
      message: "Score calculated and saved!",
      data: score,
    });
  } catch (error) {
    console.error("Score Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = { calculateScore };
