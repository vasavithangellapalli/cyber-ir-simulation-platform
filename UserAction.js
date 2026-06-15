// ============================================
// models/UserAction.js — User Action Model
// ============================================
// Every time a trainee clicks a response button (e.g.
// "Isolate Workstation"), we save it as a UserAction.
// This is used to calculate the final score.

const mongoose = require("mongoose");

const UserActionSchema = new mongoose.Schema(
  {
    // Which user performed this action?
    userId: {
      type: String,
      required: true,
      index: true,
    },

    // Which scenario is this action for?
    scenarioId: {
      type: String,
      required: true,
    },

    // Machine-friendly action key e.g. "isolate_workstation"
    actionType: {
      type: String,
      required: true,
    },

    // Human-friendly description e.g. "Isolate WORKSTATION-045"
    actionLabel: {
      type: String,
      required: true,
    },

    // containment | investigation | recovery | incorrect
    category: {
      type: String,
      enum: ["containment", "investigation", "recovery", "incorrect"],
      required: true,
    },

    // Was this the correct action to take? (for scoring)
    isCorrect: {
      type: Boolean,
      default: true,
    },

    // Points awarded for this action (can be negative for wrong actions)
    pointsAwarded: {
      type: Number,
      default: 0,
    },

    // Simulated timestamp (shown in the action log on the UI)
    simulationTime: {
      type: String,
    },

    // Optional notes / feedback for the action
    feedback: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserAction", UserActionSchema);
