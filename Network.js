// ============================================
// models/Network.js — Network Topology Model
// ============================================
// Stores the nodes (devices) and connections in the network
// for a given scenario. Powers the Network Map screen.

const mongoose = require("mongoose");

// --- Sub-schema: a single network device (node) ---
const NodeSchema = new mongoose.Schema({
  // Machine-friendly ID e.g. "ws-045"
  nodeId: { type: String, required: true },

  // Human-friendly label e.g. "WORKSTATION-045"
  label: { type: String, required: true },

  // workstation | server | firewall | router | attacker | database
  type: { type: String, required: true },

  // Emoji icon displayed in the network map
  icon: { type: String, default: "🖥️" },

  // safe | compromised | suspicious | encrypted | unknown
  status: {
    type: String,
    enum: ["safe", "compromised", "suspicious", "encrypted", "unknown"],
    default: "safe",
  },

  // IP address of this device
  ipAddress: String,

  // OS or role description e.g. "Windows 10", "Ubuntu 22.04"
  os: String,

  // Who is logged in?
  user: String,
});

// --- Sub-schema: a connection between two nodes ---
const ConnectionSchema = new mongoose.Schema({
  // nodeId of the source device
  from: { type: String, required: true },

  // nodeId of the destination device
  to: { type: String, required: true },

  // normal | suspicious | malicious | lateral_movement
  type: {
    type: String,
    enum: ["normal", "suspicious", "malicious", "lateral_movement"],
    default: "normal",
  },

  // e.g. "TLS encrypted C2 traffic", "SMB file sharing"
  description: String,
});

// --- Main Network Schema ---
const NetworkSchema = new mongoose.Schema(
  {
    scenarioId: { type: String, required: true, unique: true },
    nodes: [NodeSchema],
    connections: [ConnectionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Network", NetworkSchema);
