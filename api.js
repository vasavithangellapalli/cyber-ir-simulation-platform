// ============================================
// api.js — Frontend API Helper
// ============================================
// Drop this file next to your index.html.
// Import it in your HTML: <script src="api.js"></script>
//
// It gives you simple functions to call every backend API.
// Each function uses fetch() — the browser's built-in HTTP tool.
// ============================================

// --- Base URL of your backend server ---
// Change this if you deploy to a real server later
const API_BASE = "http://localhost:5000/api";

// ============================================
// HELPER: Makes a GET request and returns JSON
// ============================================
async function apiGet(endpoint) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`);

    // If the server returned an error status (4xx, 5xx)
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "API Error");
    }

    return await response.json();
  } catch (err) {
    console.error(`❌ GET ${endpoint} failed:`, err.message);
    throw err; // Re-throw so caller can handle it
  }
}

// ============================================
// HELPER: Makes a POST request with JSON body
// ============================================
async function apiPost(endpoint, body) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Tell server we're sending JSON
      },
      body: JSON.stringify(body), // Convert JS object → JSON string
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "API Error");
    }

    return await response.json();
  } catch (err) {
    console.error(`❌ POST ${endpoint} failed:`, err.message);
    throw err;
  }
}

// ============================================
// 1. DASHBOARD — GET /api/dashboard
// Screen: Dashboard
// Returns: stats (active incidents, alerts, completions)
//          and recentIncidents array
// ============================================
async function loadDashboard() {
  const result = await apiGet("/dashboard");

  if (result.success) {
    const { stats, recentIncidents } = result.data;

    // --- Update stat cards ---
    document.getElementById("stat-active").textContent     = stats.activeScenarios;
    document.getElementById("stat-critical").textContent   = stats.criticalAlerts;
    document.getElementById("stat-completed").textContent  = stats.completedByUsers;
    document.getElementById("stat-threat").textContent     = stats.threatLevel + "%";

    // --- Populate the alert/incident feed ---
    const feed = document.getElementById("alert-feed");
    feed.innerHTML = recentIncidents.map(incident => `
      <div class="alert-item ${incident.severity}">
        <div>
          <strong>${incident.title}</strong>
          <br><small>${incident.type.toUpperCase()} | ${incident.status}</small>
        </div>
        <span class="alert-severity severity-${incident.severity}">
          ${incident.severity.toUpperCase()}
        </span>
      </div>
    `).join("");
  }
}

// ============================================
// 2. SCENARIOS — GET /api/scenarios
// Screen: Scenario Selection
// Returns: array of scenario objects
// ============================================
async function loadScenarios(filters = {}) {
  // Build query string from filters e.g. { type: "ransomware" }
  const query = new URLSearchParams(filters).toString();
  const result = await apiGet(`/scenarios${query ? "?" + query : ""}`);

  if (result.success) {
    const container = document.getElementById("scenarios-container");
    container.innerHTML = result.data.map(scenario => `
      <div class="scenario-card" data-id="${scenario.scenarioId}">
        <h3>${scenario.title}</h3>
        <p><strong>Type:</strong> ${scenario.type}</p>
        <p><strong>Severity:</strong>
          <span class="alert-severity severity-${scenario.severity}">
            ${scenario.severity.toUpperCase()}
          </span>
        </p>
        <p>${scenario.description}</p>
        <p><strong>Duration:</strong> ${scenario.duration} minutes</p>
        <button onclick="startScenario('${scenario.scenarioId}')">
          🚀 Start Scenario
        </button>
      </div>
    `).join("");
  }
}

// Load a single scenario's detail
async function loadScenarioDetail(scenarioId) {
  const result = await apiGet(`/scenarios/${scenarioId}`);
  if (result.success) {
    const s = result.data;
    console.log("Scenario loaded:", s.title);
    // Use s.objectives, s.keyIndicators, s.background etc.
    return s;
  }
}

// ============================================
// 3. LOGS & TIMELINE — GET /api/logs/:scenarioId
// Screen: Investigation
// Returns: timeline events + evidence items
// ============================================
async function loadLogs(scenarioId) {
  const result = await apiGet(`/logs/${scenarioId}`);

  if (result.success) {
    const { timeline, evidence } = result.data;

    // --- Render timeline entries ---
    const timelineEl = document.getElementById("timeline-panel");
    timelineEl.innerHTML = timeline.map(log => `
      <div class="timeline-item ${log.severity}">
        <div class="timeline-time">${log.timestamp}</div>
        <div>
          <span class="alert-severity severity-${log.severity}">${log.category}</span>
          <strong> ${log.source}</strong>
          <p>${log.description}</p>
          ${log.ipAddress ? `<small>IP: ${log.ipAddress}</small>` : ""}
        </div>
      </div>
    `).join("");

    // --- Render evidence items ---
    const evidenceEl = document.getElementById("evidence-panel");
    evidenceEl.innerHTML = evidence.map(e => `
      <div class="evidence-item">
        <strong>🔍 ${e.category}</strong> — ${e.source}
        <p>${e.description}</p>
        <small>${e.timestamp}</small>
      </div>
    `).join("");
  }
}

// ============================================
// 4. NETWORK — GET /api/network/:scenarioId
// Screen: Network Map
// Returns: nodes[], connections[], summary stats
// ============================================
async function loadNetwork(scenarioId) {
  const result = await apiGet(`/network/${scenarioId}`);

  if (result.success) {
    const { nodes, connections, summary } = result.data;

    // --- Update summary stats ---
    document.getElementById("net-total").textContent       = summary.totalNodes;
    document.getElementById("net-compromised").textContent = summary.compromisedNodes;
    document.getElementById("net-connections").textContent = summary.maliciousConnections;

    // --- Render compromised assets list ---
    const assetsEl = document.getElementById("compromised-assets");
    const compromised = nodes.filter(n =>
      n.status === "compromised" || n.status === "encrypted"
    );
    assetsEl.innerHTML = compromised.map(node => `
      <div style="background:#2a2f4a; padding:12px; border-radius:8px;
                  margin-bottom:10px; border-left:4px solid #ff0000;">
        <strong>${node.icon} ${node.label}</strong><br>
        <small style="color:#888;">IP: ${node.ipAddress}
          ${node.user ? "| User: " + node.user : ""}</small><br>
        <small style="color:#ff4444;">Status: ${node.status.toUpperCase()}</small>
      </div>
    `).join("");

    // --- Render network connections ---
    const trafficEl = document.getElementById("network-traffic");
    const badConns = connections.filter(c =>
      c.type === "malicious" || c.type === "lateral_movement"
    );
    trafficEl.innerHTML = badConns.map(conn => `
      <div style="background:#2a2f4a; padding:12px; border-radius:8px; margin-bottom:10px;">
        <strong>${conn.type === "malicious" ? "🔴 Malicious" : "🟡 Lateral Movement"}</strong><br>
        <small style="color:#888;">${conn.from} → ${conn.to}</small><br>
        <small style="color:#ff4444;">${conn.description}</small>
      </div>
    `).join("");
  }
}

// ============================================
// 5. USER ACTION — POST /api/action
// Screen: Response Actions
// Call this when trainee clicks a response button
// ============================================
async function submitAction(actionType, actionLabel, category) {
  const result = await apiPost("/action", {
    userId: getCurrentUserId(),        // Get from session/localStorage
    scenarioId: getCurrentScenarioId(), // Currently active scenario
    actionType,   // e.g. "isolate_workstation"
    actionLabel,  // e.g. "Isolate WORKSTATION-045"
    category,     // "containment" | "investigation" | "recovery"
  });

  if (result.success) {
    // Add entry to the action log on the UI
    appendActionLog(
      result.data.simulationTime,
      actionLabel,
      result.data.isCorrect,
      result.data.feedback
    );

    // Show a brief toast/alert to the user
    showToast(
      result.data.isCorrect
        ? `✅ +${result.data.pointsAwarded} pts — ${result.data.feedback}`
        : `⚠️ ${result.data.feedback}`
    );
  }
}

// Helper: add a row to the action log panel
function appendActionLog(time, label, isCorrect, feedback) {
  const log = document.getElementById("action-log");
  const color = isCorrect ? "#00ff88" : "#ff6b00";
  const icon  = isCorrect ? "✓" : "⚠";
  const entry = document.createElement("div");
  entry.style.cssText = "background:#2a2f4a;padding:12px;border-radius:8px;margin-bottom:8px;";
  entry.innerHTML = `
    <span style="color:#888;">${time}</span> -
    <span style="color:${color};">${icon} ${label}</span>
    <br><small style="color:#aaa;">${feedback}</small>
  `;
  log.prepend(entry); // Add newest at the top
}

// ============================================
// 6. SCORE — POST /api/score
// Call when trainee clicks "Finish Scenario"
// ============================================
async function finishScenario(timeToDetect, timeToContain, timeToEradicate, systemsAffected) {
  const result = await apiPost("/score", {
    userId: getCurrentUserId(),
    scenarioId: getCurrentScenarioId(),
    timeToDetect,      // e.g. 12 (minutes)
    timeToContain,     // e.g. 8
    timeToEradicate,   // e.g. 25
    systemsAffected,   // e.g. 2
  });

  if (result.success) {
    const score = result.data;
    console.log("Score saved:", score.totalScore, score.grade);
    // Navigate to the report screen
    showScreen("report");
    loadReport(getCurrentUserId());
  }
}

// ============================================
// 7. REPORT — GET /api/report/:userId
// Screen: Final Report
// ============================================
async function loadReport(userId, scenarioId = null) {
  const query = scenarioId ? `?scenarioId=${scenarioId}` : "";
  const result = await apiGet(`/report/${userId}${query}`);

  if (result.success && result.data.length > 0) {
    const report = result.data[0]; // Show the most recent report

    // --- Overall score circle ---
    document.getElementById("score-value").textContent = report.performance.totalScore + "%";
    document.getElementById("score-label").textContent = report.performance.performanceLabel;
    document.getElementById("score-grade").textContent = report.performance.grade;

    // --- Time metrics ---
    document.getElementById("metric-detect").textContent    = report.metrics.timeToDetect + "m";
    document.getElementById("metric-contain").textContent   = report.metrics.timeToContain + "m";
    document.getElementById("metric-eradicate").textContent = report.metrics.timeToEradicate + "m";
    document.getElementById("metric-systems").textContent   = report.metrics.systemsAffected;

    // --- Strengths ---
    document.getElementById("report-strengths").innerHTML =
      report.feedback.strengths.map(s => `<li>${s}</li>`).join("");

    // --- Improvements ---
    document.getElementById("report-improvements").innerHTML =
      report.feedback.improvements.map(i => `<li>${i}</li>`).join("");

    // --- Skills ---
    document.getElementById("report-skills").innerHTML =
      report.feedback.skillsDemonstrated
        .map(s => `<span style="background:#00d9ff;color:#0a0e27;
                   padding:8px 16px;border-radius:20px;
                   font-weight:bold;">${s}</span>`)
        .join(" ");
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Get or create a userId (stored in localStorage for persistence)
function getCurrentUserId() {
  let userId = localStorage.getItem("cyberir_userId");
  if (!userId) {
    userId = "user_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("cyberir_userId", userId);
  }
  return userId;
}

// Get the currently active scenario
function getCurrentScenarioId() {
  return localStorage.getItem("cyberir_scenarioId") || "ransomware-001";
}

// Set the active scenario (call when user clicks "Start Scenario")
function startScenario(scenarioId) {
  localStorage.setItem("cyberir_scenarioId", scenarioId);
  showScreen("investigation"); // Navigate to next screen
  loadLogs(scenarioId);
  loadNetwork(scenarioId);
}

// Show a temporary toast notification
function showToast(message, duration = 3000) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed; bottom: 20px; right: 20px;
    background: #1a1f3a; color: #00d9ff;
    border: 1px solid #00d9ff; border-radius: 8px;
    padding: 12px 20px; z-index: 9999;
    font-size: 0.9em; max-width: 350px;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

// ============================================
// AUTO-LOAD: Run when the page first opens
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  loadDashboard(); // Always load dashboard stats on startup
  console.log("🔐 CyberIR Frontend connected. User:", getCurrentUserId());
});
