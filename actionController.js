// ============================================
// controllers/actionController.js
// ============================================
// Handles the POST /action endpoint.
// When a trainee clicks a response button on the
// "Incident Response Actions" screen, the frontend
// sends the action here to be saved and evaluated.

const UserAction = require("../models/UserAction");

// ----------------------------------------
// Define correct actions for each scenario.
// "correct" means the trainee should do these.
// "incorrect" means wrong / harmful actions.
// ----------------------------------------
const SCENARIO_ACTION_MAP = {
  "ransomware-001": {
    correctActions: [
      "isolate_workstation",
      "block_c2_ip",
      "disable_user_account",
      "segment_network",
      "capture_memory_dump",
      "create_disk_image",
      "analyze_network_traffic",
      "submit_malware_sample",
      "restore_from_backup",
      "rebuild_systems",
      "reset_passwords",
      "update_ioc_blocklist",
    ],
    incorrectActions: ["pay_ransom", "shutdown_all_systems", "ignore_alert"],
  },
  "phishing-001": {
    correctActions: [
      "quarantine_email",
      "reset_user_password",
      "revoke_session_tokens",
      "block_sender_domain",
      "enable_mfa",
      "analyze_email_headers",
      "check_login_logs",
      "notify_affected_users",
    ],
    incorrectActions: ["click_link", "forward_email", "ignore_alert"],
  },
  "insider-001": {
    correctActions: [
      "disable_user_account",
      "preserve_evidence",
      "review_access_logs",
      "interview_employee",
      "check_dlp_alerts",
      "revoke_vPN_access",
      "contact_hr_legal",
      "document_incident",
    ],
    incorrectActions: ["delete_logs", "alert_suspect", "ignore_alert"],
  },
};

// Points awarded per action category
const POINTS = {
  containment: 15,
  investigation: 10,
  recovery: 12,
  incorrect: -10, // Penalty for wrong actions
};

// ----------------------------------------
// POST /action
// Body: { userId, scenarioId, actionType, actionLabel, category }
// ----------------------------------------
const recordAction = async (req, res) => {
  try {
    const { userId, scenarioId, actionType, actionLabel, category } = req.body;

    // --- Basic Validation ---
    if (!userId || !scenarioId || !actionType || !category) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, scenarioId, actionType, category",
      });
    }

    // --- Determine if action is correct ---
    const scenarioRules = SCENARIO_ACTION_MAP[scenarioId];
    let isCorrect = true;
    let feedback = "Good action! This helps contain or investigate the incident.";

    if (scenarioRules) {
      if (scenarioRules.incorrectActions.includes(actionType)) {
        isCorrect = false;
        feedback = "⚠️ This action is NOT recommended and may worsen the incident.";
      }
    }

    // --- Calculate points ---
    const pointsAwarded = isCorrect ? (POINTS[category] || 5) : POINTS.incorrect;

    // --- Generate a simulated clock time for the action log ---
    const now = new Date();
    const simulationTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

    // --- Save the action to MongoDB ---
    const action = await UserAction.create({
      userId,
      scenarioId,
      actionType,
      actionLabel,
      category,
      isCorrect,
      pointsAwarded,
      simulationTime,
      feedback,
    });

    res.status(201).json({
      success: true,
      message: isCorrect
        ? "✅ Action recorded successfully!"
        : "⚠️ Action recorded (but this may cost you points)",
      data: {
        actionId: action._id,
        simulationTime,
        isCorrect,
        pointsAwarded,
        feedback,
      },
    });
  } catch (error) {
    console.error("Record Action Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = { recordAction };
