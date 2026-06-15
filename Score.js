// ============================================
// models/Score.js — Score / Report Model
// ============================================
// Stores the final calculated score for a user's
// completed scenario session.

const mongoose = require("mongoose");

const ScoreSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    scenarioId: { type: String, required: true },

    // --- Overall Score ---
    totalScore: { type: Number, default: 0 },    // e.g. 85
    maxScore: { type: Number, default: 100 },     // always 100
    grade: { type: String, default: "F" },        // A, B, C, D, F
    performanceLabel: { type: String },           // "Excellent Response"

    // --- Category Breakdown ---
    containmentScore: { type: Number, default: 0 },
    investigationScore: { type: Number, default: 0 },
    recoveryScore: { type: Number, default: 0 },

    // --- Time Metrics (in minutes) ---
    timeToDetect: { type: Number, default: 0 },
    timeToContain: { type: Number, default: 0 },
    timeToEradicate: { type: Number, default: 0 },

    // --- Incident Impact ---
    systemsAffected: { type: Number, default: 0 },
    actionsPerformed: { type: Number, default: 0 },
    correctActions: { type: Number, default: 0 },
    incorrectActions: { type: Number, default: 0 },

    // --- Feedback Arrays ---
    strengths: [String],
    improvements: [String],
    skillsDemonstrated: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Score", ScoreSchema);
