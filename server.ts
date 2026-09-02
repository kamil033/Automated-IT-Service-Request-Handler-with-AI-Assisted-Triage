import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Fallback rule-based classifier if Gemini is unavailable or fails
function ruleBasedTriage(shortDescription: string, description: string) {
  const text = `${shortDescription} ${description}`.toLowerCase();
  
  // Security
  if (
    text.includes("phish") ||
    text.includes("malware") ||
    text.includes("ransomware") ||
    text.includes("breach") ||
    text.includes("hacked") ||
    text.includes("leak") ||
    text.includes("suspicious email") ||
    text.includes("unauthorized")
  ) {
    return {
      category: "Security",
      subcategory: "Malware / Phishing Incident",
      urgency: 1,
      impact: 1,
      priority: 1,
      assignmentGroup: "SecOps Incident Response",
      confidence: 0.97,
      reasoning: "Threat indicators detected (security keyword match). Requires urgent isolation and SecOps on-call engagement under standard Incident Response Playbook.",
      sentiment: "Urgent",
      suggestedFix: "Immediate endpoint isolation via EDR, revoke active session tokens, and review firewall outbound logs.",
      autoAction: "SecOps P1 On-Call Notification sent via sysevent_email_action; quarantined user account.",
      isAiPowered: false,
    };
  }

  // Network / Outage
  if (
    text.includes("vpn") ||
    text.includes("firewall") ||
    text.includes("dns") ||
    text.includes("network down") ||
    text.includes("switch") ||
    text.includes("router") ||
    text.includes("wi-fi") ||
    text.includes("wifi") ||
    text.includes("gateway") ||
    text.includes("packet loss")
  ) {
    const isCritical = text.includes("outage") || text.includes("all users") || text.includes("down") || text.includes("entire");
    return {
      category: "Network",
      subcategory: isCritical ? "Infrastructure Outage" : "VPN & Connectivity",
      urgency: isCritical ? 1 : 2,
      impact: isCritical ? 1 : 2,
      priority: isCritical ? 1 : 2,
      assignmentGroup: "Network Infrastructure",
      confidence: 0.94,
      reasoning: "Connectivity keywords identified. Evaluated scope against network infrastructure topology.",
      sentiment: isCritical ? "Urgent" : "Frustrated",
      suggestedFix: "Validate Cisco Meraki/Palo Alto gateway tunnel status, verify DHCP lease allocation, and re-authenticate SAML profile.",
      autoAction: isCritical ? "Triggered P1 Network Bridge conference and attached 4-hr SLA" : "Attached standard 8-hr SLA definition",
      isAiPowered: false,
    };
  }

  // Database / Cloud
  if (
    text.includes("database") ||
    text.includes("sql") ||
    text.includes("postgres") ||
    text.includes("aws") ||
    text.includes("gcp") ||
    text.includes("azure") ||
    text.includes("kubernetes") ||
    text.includes("rds") ||
    text.includes("cluster")
  ) {
    return {
      category: "Cloud & DB",
      subcategory: "Database / Cloud Infrastructure",
      urgency: 2,
      impact: 2,
      priority: 2,
      assignmentGroup: "Cloud Platform & DB",
      confidence: 0.92,
      reasoning: "Matched database/cloud infrastructure services. Directed to Cloud Platform DBA team.",
      sentiment: "Neutral",
      suggestedFix: "Check CloudWatch / GCP monitoring metrics, review query deadlock locks in pg_stat_activity, and verify connection pool headroom.",
      autoAction: "Attached 8-hr Database Operations SLA and linked CloudWatch dashboard",
      isAiPowered: false,
    };
  }

  // Hardware
  if (
    text.includes("laptop") ||
    text.includes("monitor") ||
    text.includes("keyboard") ||
    text.includes("macbook") ||
    text.includes("battery") ||
    text.includes("dock") ||
    text.includes("printer") ||
    text.includes("headset") ||
    text.includes("broken screen")
  ) {
    const isSwollen = text.includes("swollen") || text.includes("smoke") || text.includes("fire") || text.includes("heat");
    return {
      category: "Hardware",
      subcategory: isSwollen ? "Battery Hazard / Physical Damage" : "Peripherals & Workstation",
      urgency: isSwollen ? 1 : 3,
      impact: isSwollen ? 2 : 3,
      priority: isSwollen ? 2 : 4,
      assignmentGroup: "Hardware Asset Support",
      confidence: 0.95,
      reasoning: "Physical device asset issue identified. Hardware inventory asset tracking flow engaged.",
      sentiment: isSwollen ? "Urgent" : "Calm",
      suggestedFix: isSwollen ? "Immediately disconnect charger, power off device, and deposit in fire-safe containment bin for immediate hot-swap replacement." : "Verify peripheral USB-C firmware, test alternative display port cable, or schedule walk-up desk appointment.",
      autoAction: isSwollen ? "Dispatched Emergency Hardware Loaner Request to Facility Desk" : "Generated Walk-Up Tech Bar Appointment Slot",
      isAiPowered: false,
    };
  }

  // Software / Access
  if (
    text.includes("license") ||
    text.includes("password") ||
    text.includes("login") ||
    text.includes("access") ||
    text.includes("permission") ||
    text.includes("jira") ||
    text.includes("github") ||
    text.includes("slack") ||
    text.includes("office 365") ||
    text.includes("outlook") ||
    text.includes("teams")
  ) {
    const isPassword = text.includes("password") || text.includes("locked out") || text.includes("reset");
    return {
      category: "Software",
      subcategory: isPassword ? "Identity & Access Management" : "SaaS Applications",
      urgency: isPassword ? 2 : 3,
      impact: isPassword ? 3 : 3,
      priority: isPassword ? 3 : 4,
      assignmentGroup: "Service Desk Tier 1",
      confidence: 0.91,
      reasoning: "SaaS application and access provisioning request detected. Suitable for automated fulfillment or Tier 1 triage.",
      sentiment: "Neutral",
      suggestedFix: isPassword ? "Trigger automated Okta/Azure AD Self-Service Password Reset SMS challenge." : "Route request to manager approval queue in sc_req_item workflow.",
      autoAction: isPassword ? "Executed Automated Okta Self-Service Reset Link" : "Created sc_task approval request for Department Manager",
      isAiPowered: false,
    };
  }

  // General / Default
  return {
    category: "Inquiry / Help",
    subcategory: "General IT Inquiry",
    urgency: 3,
    impact: 3,
    priority: 4,
    assignmentGroup: "Service Desk Tier 1",
    confidence: 0.85,
    reasoning: "Standard inquiry detected without high-severity keywords. Assigned to Tier 1 Service Desk intake.",
    sentiment: "Calm",
    suggestedFix: "Review Knowledge Base Article KB0021094 for self-service guidelines or contact IT Service Desk live agent.",
    autoAction: "Attached Standard Tier 1 24-hr SLA definition",
    isAiPowered: false,
  };
}

// AI-Assisted Triage Route
app.post("/api/triage", async (req, res) => {
  try {
    const { shortDescription = "", description = "", caller = "Unknown User" } = req.body;

    if (!shortDescription && !description) {
      return res.status(400).json({ error: "shortDescription or description is required" });
    }

    // If Gemini is available, attempt AI model classification
    if (ai) {
      try {
        const prompt = `You are the ServiceNow "Now Assist" Agentic IT Service Request Classifier & Triage Specialist.
Analyze the following IT incident or service request ticket and return a strict JSON triage object:

Ticket Details:
- Caller: ${caller}
- Short Description: ${shortDescription}
- Detailed Description: ${description}

Classify into one of the following exact ServiceNow categories:
"Hardware", "Software", "Network", "Security", "Cloud & DB", "Inquiry / Help"

Assignment groups available:
- "Network Infrastructure"
- "SecOps Incident Response"
- "Cloud Platform & DB"
- "Hardware Asset Support"
- "Service Desk Tier 1"

Urgency (1=High, 2=Medium, 3=Low)
Impact (1=High, 2=Medium, 3=Low)
Priority matrix calculation:
- Urgency 1 & Impact 1 -> Priority 1 (Critical)
- Urgency 1 & Impact 2 OR Urgency 2 & Impact 1 -> Priority 2 (High)
- Urgency 2 & Impact 2 OR Urgency 1 & Impact 3 OR Urgency 3 & Impact 1 -> Priority 3 (Moderate)
- Otherwise -> Priority 4 (Low)

Sentiment: "Urgent", "Frustrated", "Neutral", or "Calm".
Provide a clear, professional technical reasoning explanation (2-3 sentences), actionable suggested fix or resolution step, and an automated action trigger note.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                subcategory: { type: Type.STRING },
                urgency: { type: Type.INTEGER },
                impact: { type: Type.INTEGER },
                priority: { type: Type.INTEGER },
                assignmentGroup: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
                reasoning: { type: Type.STRING },
                sentiment: { type: Type.STRING },
                suggestedFix: { type: Type.STRING },
                autoAction: { type: Type.STRING },
              },
              required: [
                "category",
                "subcategory",
                "urgency",
                "impact",
                "priority",
                "assignmentGroup",
                "confidence",
                "reasoning",
                "sentiment",
                "suggestedFix",
                "autoAction",
              ],
            },
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          return res.json({
            ...parsed,
            isAiPowered: true,
            model: "gemini-3.8-flash",
          });
        }
      } catch (geminiError) {
        console.warn("Gemini generation encountered error, falling back to rule-based triage:", geminiError);
      }
    }

    // Fallback to intelligent rule-based triage
    const fallbackResult = ruleBasedTriage(shortDescription, description);
    return res.json(fallbackResult);
  } catch (error: any) {
    console.error("Triage endpoint error:", error);
    const fallbackResult = ruleBasedTriage(req.body.shortDescription || "", req.body.description || "");
    return res.json(fallbackResult);
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    instance: "ServiceNow Polaris dev108422 (Rome / Washington DC)",
    geminiConfigured: !!apiKey,
    uptimeSeconds: Math.floor(process.uptime()),
    activeTables: ["incident", "task", "sc_req_item", "sys_user", "sys_user_group", "sys_atf_test"],
  });
});

// Vite integration
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ServiceNow Mini System server running on http://0.0.0.0:${PORT}`);
  });
}

start();
