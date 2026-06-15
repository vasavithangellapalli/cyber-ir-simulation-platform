// ============================================
// seed/seedData.js — Sample Data for MongoDB
// ============================================
// Run this ONCE to populate your database with sample scenarios.
// Command: npm run seed
//
// It inserts:
//  - 3 Scenarios (ransomware, phishing, insider threat)
//  - Logs for each scenario
//  - Network topology for each scenario

require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");

const Scenario = require("../models/Scenario");
const Log      = require("../models/Log");
const Network  = require("../models/Network");

// ============================================
// SAMPLE SCENARIOS
// ============================================
const scenarios = [
  {
    scenarioId: "ransomware-001",
    title: "Ransomware Attack — Alpha Corp",
    type: "ransomware",
    severity: "critical",
    description:
      "A ransomware attack has encrypted files across multiple systems. Immediate containment required.",
    background:
      "At 14:15, the SIEM triggered a critical alert: multiple endpoints started showing signs of file encryption. User jsmith on WORKSTATION-045 opened a malicious email attachment, which deployed the RansomX malware. The malware quickly spread via SMB to the file server.",
    duration: 45,
    objectives: [
      "Identify the patient zero (initial infected machine)",
      "Isolate compromised systems from the network",
      "Block C2 (Command & Control) communication",
      "Preserve forensic evidence",
      "Restore operations from backup",
    ],
    keyIndicators: [
      "File extension changes to .locked or .encrypted",
      "Ransom note (README.txt) appearing on desktops",
      "High outbound traffic to 185.220.101.45",
      "SMB traffic between WORKSTATION-045 and FILE-SERVER-01",
    ],
    status: "active",
  },
  {
    scenarioId: "phishing-001",
    title: "Spear Phishing — Executive Account Compromise",
    type: "phishing",
    severity: "high",
    description:
      "CFO account has been compromised via a targeted phishing email. Attacker may have accessed financial systems.",
    background:
      "The CFO received a convincing email appearing to be from the CEO requesting urgent wire transfer approval. The email contained a link to a fake Microsoft 365 login page. After entering credentials, the attacker gained access and started exploring internal systems.",
    duration: 30,
    objectives: [
      "Confirm whether credentials were actually compromised",
      "Revoke active sessions and reset credentials",
      "Determine what data the attacker accessed",
      "Block phishing domain",
      "Enable MFA on affected accounts",
    ],
    keyIndicators: [
      "Login from unusual IP: 103.21.244.0 (Eastern Europe)",
      "Email from ceo@alpha-c0rp.com (note the zero instead of 'o')",
      "Multiple failed MFA attempts on CFO account",
      "Azure AD sign-in alert from unknown device",
    ],
    status: "active",
  },
  {
    scenarioId: "insider-001",
    title: "Insider Threat — Data Exfiltration",
    type: "insider_threat",
    severity: "high",
    description:
      "A departing employee is suspected of exfiltrating sensitive customer data before their last day.",
    background:
      "HR notified security that an employee (David Chen, dchen) submitted resignation 2 weeks ago. DLP alerts fired showing dchen copying large volumes of customer PII to a personal USB drive and uploading files to a personal Google Drive account. The employee is still active.",
    duration: 35,
    objectives: [
      "Preserve all logs and evidence before taking action",
      "Determine scope of data exfiltration",
      "Disable access without alerting the suspect prematurely",
      "Coordinate with HR and Legal",
      "Document the full incident timeline",
    ],
    keyIndicators: [
      "DLP alert: 2.3 GB uploaded to drive.google.com from dchen account",
      "USB mass storage device connected to WORKSTATION-112 at 08:45",
      "Bulk download of customer database reports (after hours: 21:30)",
      "VPN connected from personal IP outside of work hours",
    ],
    status: "active",
  },
];

// ============================================
// SAMPLE LOGS
// ============================================
const logs = [
  // --- Ransomware Logs ---
  { scenarioId: "ransomware-001", timestamp: "14:13:02", category: "EMAIL",   source: "Email Gateway",   severity: "medium", description: "Phishing email received by jsmith@alphacorp.com from attacker45@evil.ru", ipAddress: "192.168.1.45", hostname: "WORKSTATION-045", isEvidence: true },
  { scenarioId: "ransomware-001", timestamp: "14:15:30", category: "MALWARE", source: "EDR",             severity: "critical", description: "Malicious attachment Invoice_Q4.exe executed on WORKSTATION-045", ipAddress: "192.168.1.45", hostname: "WORKSTATION-045", isEvidence: true },
  { scenarioId: "ransomware-001", timestamp: "14:16:00", category: "NETWORK", source: "Firewall",        severity: "critical", description: "Outbound C2 connection: 192.168.1.45 → 185.220.101.45:443 (TLS)", ipAddress: "185.220.101.45", hostname: "WORKSTATION-045", isEvidence: true },
  { scenarioId: "ransomware-001", timestamp: "14:18:10", category: "MALWARE", source: "SIEM",            severity: "critical", description: "Mass file modification detected — .locked extension appearing on WORKSTATION-045", ipAddress: "192.168.1.45", hostname: "WORKSTATION-045", isEvidence: true },
  { scenarioId: "ransomware-001", timestamp: "14:20:45", category: "NETWORK", source: "Firewall",        severity: "high",     description: "Lateral movement: SMB traffic 192.168.1.45 → 192.168.1.78:445", ipAddress: "192.168.1.78", hostname: "FILE-SERVER-01",   isEvidence: true },
  { scenarioId: "ransomware-001", timestamp: "14:22:00", category: "MALWARE", source: "EDR",             severity: "critical", description: "FILE-SERVER-01 file encryption started — 847 files affected", ipAddress: "192.168.1.78", hostname: "FILE-SERVER-01",   isEvidence: false },
  { scenarioId: "ransomware-001", timestamp: "14:23:30", category: "ALERT",   source: "SIEM",            severity: "critical", description: "Ransom note README.txt dropped on multiple desktops — RansomX variant identified", isEvidence: false },
  { scenarioId: "ransomware-001", timestamp: "14:25:00", category: "AUTH",    source: "Active Directory", severity: "high",    description: "jsmith account used for remote service installation on FILE-SERVER-01", ipAddress: "192.168.1.78", hostname: "FILE-SERVER-01", isEvidence: true },

  // --- Phishing Logs ---
  { scenarioId: "phishing-001", timestamp: "09:02:11", category: "EMAIL",   source: "Email Gateway",   severity: "high",     description: "Spear phishing email delivered to cfo@alphacorp.com from ceo@alpha-c0rp.com", isEvidence: true },
  { scenarioId: "phishing-001", timestamp: "09:15:44", category: "AUTH",    source: "Azure AD",        severity: "critical", description: "CFO credentials entered on fake login page: login.microsoftonline.phish.ru", isEvidence: true },
  { scenarioId: "phishing-001", timestamp: "09:16:02", category: "AUTH",    source: "Azure AD",        severity: "critical", description: "Successful login to CFO account from IP 103.21.244.0 (Kyiv, Ukraine)", ipAddress: "103.21.244.0", isEvidence: true },
  { scenarioId: "phishing-001", timestamp: "09:18:30", category: "NETWORK", source: "Proxy",           severity: "high",     description: "Attacker browsed SharePoint for 'financial', 'wire transfer', 'bank account' documents", isEvidence: true },
  { scenarioId: "phishing-001", timestamp: "09:25:00", category: "EMAIL",   source: "Email Gateway",   severity: "critical", description: "Attacker sent wire transfer request email to finance team from CFO account", isEvidence: true },
  { scenarioId: "phishing-001", timestamp: "09:30:10", category: "AUTH",    source: "Azure AD",        severity: "medium",   description: "Multiple MFA push notifications sent to CFO mobile — CFO reports not requesting access", isEvidence: false },

  // --- Insider Threat Logs ---
  { scenarioId: "insider-001", timestamp: "08:45:00", category: "DLP",     source: "DLP Agent",       severity: "high",     description: "USB mass storage device connected to WORKSTATION-112 (dchen)", hostname: "WORKSTATION-112", isEvidence: true },
  { scenarioId: "insider-001", timestamp: "08:46:30", category: "DLP",     source: "DLP Agent",       severity: "critical", description: "456 files copied to USB: includes customer_data.xlsx, contracts_2024.zip", hostname: "WORKSTATION-112", isEvidence: true },
  { scenarioId: "insider-001", timestamp: "21:30:00", category: "AUTH",    source: "Active Directory", severity: "medium",  description: "dchen logged in after hours via VPN (personal IP: 82.45.120.33)", ipAddress: "82.45.120.33", isEvidence: true },
  { scenarioId: "insider-001", timestamp: "21:32:00", category: "DLP",     source: "CASB",            severity: "critical", description: "2.3 GB uploaded to drive.google.com from dchen session — 14 files", isEvidence: true },
  { scenarioId: "insider-001", timestamp: "21:45:00", category: "DB",      source: "Database Audit",  severity: "high",     description: "Bulk export of CustomerPII table (87,432 records) by dchen", isEvidence: true },
];

// ============================================
// SAMPLE NETWORK DATA
// ============================================
const networks = [
  {
    scenarioId: "ransomware-001",
    nodes: [
      { nodeId: "fw-01",   label: "Firewall",        type: "firewall",    icon: "🛡️",  status: "safe",        ipAddress: "192.168.1.1"  },
      { nodeId: "ws-045",  label: "WORKSTATION-045", type: "workstation", icon: "💻",  status: "compromised", ipAddress: "192.168.1.45", user: "jsmith" },
      { nodeId: "fs-01",   label: "FILE-SERVER-01",  type: "server",      icon: "🗄️",  status: "encrypted",   ipAddress: "192.168.1.78" },
      { nodeId: "db-01",   label: "DB-SERVER-01",    type: "database",    icon: "🗄️",  status: "safe",        ipAddress: "192.168.1.100" },
      { nodeId: "ws-099",  label: "WORKSTATION-099", type: "workstation", icon: "💻",  status: "safe",        ipAddress: "192.168.1.99" },
      { nodeId: "c2-ext",  label: "C2 Server (External)", type: "attacker", icon: "☠️", status: "unknown",    ipAddress: "185.220.101.45" },
    ],
    connections: [
      { from: "ws-045", to: "c2-ext", type: "malicious",       description: "TLS encrypted C2 traffic (HTTPS:443)" },
      { from: "ws-045", to: "fs-01",  type: "lateral_movement", description: "SMB lateral movement (port 445)" },
      { from: "fw-01",  to: "ws-045", type: "normal",           description: "Internal network traffic" },
      { from: "fw-01",  to: "db-01",  type: "normal",           description: "Normal DB traffic" },
    ],
  },
  {
    scenarioId: "phishing-001",
    nodes: [
      { nodeId: "cfo-pc",  label: "CFO-LAPTOP",      type: "workstation", icon: "💼",  status: "compromised", ipAddress: "192.168.2.10", user: "cfo" },
      { nodeId: "m365",    label: "Microsoft 365",   type: "server",      icon: "☁️",  status: "suspicious",  ipAddress: "40.99.0.0" },
      { nodeId: "sp-01",   label: "SharePoint",      type: "server",      icon: "📁",  status: "suspicious",  ipAddress: "192.168.2.50" },
      { nodeId: "attk-ip", label: "Attacker IP",     type: "attacker",    icon: "☠️",  status: "unknown",     ipAddress: "103.21.244.0" },
      { nodeId: "fin-ws",  label: "FINANCE-01",      type: "workstation", icon: "💻",  status: "safe",        ipAddress: "192.168.2.20", user: "finance_team" },
    ],
    connections: [
      { from: "attk-ip", to: "m365",   type: "malicious",  description: "Attacker authenticated to M365 with stolen credentials" },
      { from: "attk-ip", to: "sp-01",  type: "malicious",  description: "Unauthorized SharePoint access — document search" },
      { from: "cfo-pc",  to: "m365",   type: "suspicious", description: "Normal M365 access (credentials now compromised)" },
    ],
  },
  {
    scenarioId: "insider-001",
    nodes: [
      { nodeId: "ws-112",  label: "WORKSTATION-112", type: "workstation", icon: "💻",  status: "suspicious",  ipAddress: "192.168.3.12", user: "dchen" },
      { nodeId: "usb-drv", label: "USB Drive",       type: "server",      icon: "💾",  status: "suspicious",  ipAddress: "N/A" },
      { nodeId: "gdrive",  label: "Google Drive",    type: "server",      icon: "☁️",  status: "suspicious",  ipAddress: "142.250.0.0" },
      { nodeId: "db-cust", label: "Customer DB",     type: "database",    icon: "🗄️",  status: "suspicious",  ipAddress: "192.168.3.50" },
      { nodeId: "vpn-gw",  label: "VPN Gateway",     type: "router",      icon: "🔑",  status: "suspicious",  ipAddress: "192.168.3.1"  },
    ],
    connections: [
      { from: "ws-112",  to: "usb-drv", type: "lateral_movement", description: "456 files copied to personal USB drive" },
      { from: "ws-112",  to: "gdrive",  type: "lateral_movement", description: "2.3 GB uploaded to personal Google Drive (after hours)" },
      { from: "ws-112",  to: "db-cust", type: "suspicious",       description: "Bulk export of 87,432 customer PII records" },
      { from: "vpn-gw",  to: "ws-112",  type: "suspicious",       description: "After-hours VPN access from personal IP" },
    ],
  },
];

// ============================================
// SEED FUNCTION — Insert data into MongoDB
// ============================================
const seed = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/cyberir");
    console.log("✅ Connected to MongoDB");

    // Clear existing data (so we don't duplicate on re-run)
    await Scenario.deleteMany({});
    await Log.deleteMany({});
    await Network.deleteMany({});
    console.log("🗑️  Cleared old data");

    // Insert fresh data
    await Scenario.insertMany(scenarios);
    console.log(`✅ Inserted ${scenarios.length} scenarios`);

    await Log.insertMany(logs);
    console.log(`✅ Inserted ${logs.length} logs`);

    await Network.insertMany(networks);
    console.log(`✅ Inserted ${networks.length} network topologies`);

    console.log("\n🎉 Database seeded successfully! You can now start the server.\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed Error:", error.message);
    process.exit(1);
  }
};

seed();
