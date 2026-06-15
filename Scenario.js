// ============================================
// models/Scenario.js — Scenario Data Model
// ============================================
// A "model" defines the shape/structure of data we store in MongoDB.
// Think of it like a blueprint or form template.

const mongoose = require("mongoose");

// Schema = the blueprint for a Scenario document in MongoDB
const ScenarioSchema = new mongoose.Schema(
  {
    // Unique short identifier e.g. "ransomware-001"
    scenarioId: {
      type: String,
      required: true,
      unique: true,
    },

    // Display title e.g. "Ransomware Attack - Alpha Corp"
    title: {
      type: String,
      required: true,
    },

    // One of: ransomware | phishing | insider_threat
    type: {
      type: String,
      enum: ["ransomware", "phishing", "insider_threat"],
      required: true,
    },

    // critical | high | medium | low
    severity: {
      type: String,
      enum: ["critical", "high", "medium", "low"],
      required: true,
    },

    // Short description shown on the scenario card
    description: {
      type: String,
      required: true,
    },

    // Longer background story shown when the scenario loads
    background: {
      type: String,
    },

    // Duration in minutes (e.g. 45)
    duration: {
      type: Number,
      default: 45,
    },

    // Objectives the trainee must complete
    objectives: [String],

    // Key facts / clues about the incident
    keyIndicators: [String],

    // active | completed | archived
    status: {
      type: String,
      enum: ["active", "completed", "archived"],
      default: "active",
    },
  },
  {
    // Automatically adds createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Export the model so other files can use it
module.exports = mongoose.model("Scenario", ScenarioSchema);
