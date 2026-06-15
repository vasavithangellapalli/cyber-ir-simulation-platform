// ============================================
// models/Log.js — Log / Timeline Event Model
// ============================================
// Logs represent timeline events during an incident.
// Each log is tied to a specific scenario (scenarioId).

const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema(
  {
    // Which scenario does this log belong to?
    scenarioId: {
      type: String,
      required: true,
      index: true, // Index speeds up queries filtering by scenarioId
    },

    // When did this event happen (simulation time)?
    timestamp: {
      type: String,
      required: true,
    },

    // Short category e.g. "MALWARE", "NETWORK", "AUTH"
    category: {
      type: String,
      required: true,
    },

    // What happened?
    description: {
      type: String,
      required: true,
    },

    // Source system e.g. "EDR", "Firewall", "SIEM", "Email Gateway"
    source: {
      type: String,
      required: true,
    },

    // critical | high | medium | low | info
    severity: {
      type: String,
      enum: ["critical", "high", "medium", "low", "info"],
      default: "info",
    },

    // Optional IP address involved
    ipAddress: String,

    // Optional hostname involved
    hostname: String,

    // Is this a key evidence item? (highlighted in UI)
    isEvidence: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Log", LogSchema);
