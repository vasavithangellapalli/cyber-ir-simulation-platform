// ============================================
// controllers/networkController.js
// ============================================
// Returns the network topology (nodes + connections)
// for a given scenario. Powers the Network Map screen.

const Network = require("../models/Network");

// ----------------------------------------
// GET /network/:scenarioId
// Returns nodes and connections for the network map
// ----------------------------------------
const getNetworkByScenario = async (req, res) => {
  try {
    const { scenarioId } = req.params;

    const network = await Network.findOne({ scenarioId });

    if (!network) {
      return res.status(404).json({
        success: false,
        message: `No network data found for scenario: ${scenarioId}`,
      });
    }

    // Add some computed stats the frontend can display as a summary
    const compromisedCount = network.nodes.filter(
      (n) => n.status === "compromised" || n.status === "encrypted"
    ).length;

    const maliciousConnections = network.connections.filter(
      (c) => c.type === "malicious" || c.type === "lateral_movement"
    ).length;

    res.status(200).json({
      success: true,
      scenarioId,
      data: {
        nodes: network.nodes,
        connections: network.connections,
        summary: {
          totalNodes: network.nodes.length,
          compromisedNodes: compromisedCount,
          totalConnections: network.connections.length,
          maliciousConnections,
        },
      },
    });
  } catch (error) {
    console.error("Get Network Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = { getNetworkByScenario };
