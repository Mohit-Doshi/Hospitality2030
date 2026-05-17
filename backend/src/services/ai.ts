import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-4-20250514";

const LUXURY_SYSTEM = `You are the hospitality intelligence layer for Rosewood Sand Hill, a luxury hotel.
Write in a calm, discreet, concierge-like tone. Avoid robotic phrasing, excessive enthusiasm, corporate jargon, and surveillance language.
Abstract insights into service-oriented hospitality language. Never include raw PII or creepy personalization.
Keep responses concise and operationally useful for hotel staff.`;

function getClient(): Anthropic | null {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) return null;
  return new Anthropic({ apiKey: key });
}

function extractText(message: Anthropic.Message): string | null {
  const block = message.content[0];
  return block.type === "text" ? block.text.trim() : null;
}

function parseJson<T>(text: string): T | null {
  try {
    const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]) as T;
  } catch (e) {
    console.error("[ai] JSON parse failed:", e);
  }
  return null;
}

async function callClaude(
  userPrompt: string,
  maxTokens = 600
): Promise<string | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      system: LUXURY_SYSTEM,
      messages: [{ role: "user", content: userPrompt }],
    });
    return extractText(message);
  } catch (e) {
    console.error("[ai] Anthropic call failed:", e);
    return null;
  }
}

export async function generateNarrative(
  guestContext: Record<string, unknown>
): Promise<string> {
  const text = await callClaude(
    `Generate a 2-3 sentence hospitality guest narrative for staff briefing. Context:\n${JSON.stringify(guestContext, null, 2)}`,
    300
  );
  return text ?? fallbackNarrative(guestContext);
}

export async function generateRecommendations(
  guestContext: Record<string, unknown>
): Promise<Array<{ type: string; reason: string; priority: string }>> {
  const text = await callClaude(
    `Return ONLY a JSON array of 3-5 operational recommendations. Each item: { "type": string, "reason": string, "priority": "high"|"medium"|"low" }.
Consider liveSignals, pendingRecommendations, and historic context — avoid duplicating pending actions.
Context:\n${JSON.stringify(guestContext, null, 2)}`,
    500
  );
  if (text) {
    const parsed = parseJson<Array<{ type: string; reason: string; priority: string }>>(text);
    if (parsed?.length) return parsed;
  }
  return fallbackRecommendations(guestContext);
}

export async function classifyArchetype(
  guestContext: Record<string, unknown>
): Promise<string> {
  const text = await callClaude(
    `Classify into ONE archetype: Restorative Executive, Cultural Explorer, Status Sensitive VIP, or Family Memory Builder. Reply with only the archetype name. Context:\n${JSON.stringify(guestContext, null, 2)}`,
    50
  );
  return text ?? (guestContext.archetype as string) ?? "Restorative Executive";
}

export interface ScenarioAnalysis {
  eventType: "complaint" | "compliment" | "neutral" | "operational";
  urgency: "low" | "medium" | "high";
  analysis: string;
}

export interface ScenarioRemedy {
  action: string;
  reason: string;
  priority: "high" | "medium" | "low";
  assignTo?: string;
}

export interface ScenarioDiagnosis {
  diagnosis: string;
  remedies: ScenarioRemedy[];
  suggestedStaff: string | null;
  handlingTone: string;
}

export async function analyzeScenario(
  scenarioText: string,
  guestContext: Record<string, unknown>
): Promise<ScenarioAnalysis> {
  const text = await callClaude(
    `A live hospitality scenario was reported for an in-house guest. Analyze it for staff.

Scenario: "${scenarioText}"

Guest context includes:
- memories, incidents, affinities (historic institutional memory)
- liveSignals: prior scenarios already reported for THIS guest today — consider patterns and escalation
- relatedPropertySignals: other guests affected by the same property-wide event (if any)
- pendingRecommendations: active staff actions already suggested — do not ignore these

Full context:
${JSON.stringify(guestContext, null, 2)}

If liveSignals show a recurring issue, increase urgency and reference the pattern discreetly.
If pendingRecommendations already address this, note continuity in your analysis.

Return ONLY JSON:
{
  "eventType": "complaint" | "compliment" | "neutral" | "operational",
  "urgency": "low" | "medium" | "high",
  "analysis": "2-3 sentence operational summary for staff — discreet, no surveillance language"
}`,
    400
  );

  const parsed = text ? parseJson<ScenarioAnalysis>(text) : null;
  if (parsed?.analysis) return parsed;

  return fallbackAnalyzeScenario(scenarioText, guestContext);
}

export async function diagnoseScenario(
  scenarioText: string,
  analysis: ScenarioAnalysis,
  guestContext: Record<string, unknown>
): Promise<ScenarioDiagnosis> {
  const affinities = (guestContext.affinities as Array<{ staffName: string; role: string; affinityScore: number }>) ?? [];
  const topStaff = affinities[0];

  const text = await callClaude(
    `You are advising Rosewood Sand Hill staff on handling a live guest scenario.

Scenario: "${scenarioText}"
Classification: ${analysis.eventType} (urgency: ${analysis.urgency})
Initial analysis: ${analysis.analysis}

Full guest context (memories, incidents, affinities, liveSignals, pendingRecommendations):
${JSON.stringify(guestContext, null, 2)}

Rules:
- For COMPLAINTS: prioritize recovery, empathy, discreet escalation; reference prior friction if relevant; suggest staff with highest affinity when appropriate.
- For COMPLIMENTS: suggest thoughtful acknowledgment or amenity — avoid over-the-top gestures; reinforce what worked.
- For OPERATIONAL/NEUTRAL: practical orchestration steps only.
- Use liveSignals and relatedPropertySignals: if this repeats a prior signal, escalate or refine — do not contradict earlier staff guidance without reason.
- Use pendingRecommendations: avoid duplicate remedies; complement, supersede, or consolidate when appropriate.
- Never sound robotic or surveillance-like.

Return ONLY JSON:
{
  "diagnosis": "2-4 sentence staff briefing on how to handle this",
  "handlingTone": "brief phrase e.g. discreet recovery / warm acknowledgment",
  "suggestedStaff": "staff name or null",
  "remedies": [
    { "action": "snake_case_action", "reason": "why", "priority": "high|medium|low", "assignTo": "staff name or null" }
  ]
}`,
    700
  );

  const parsed = text ? parseJson<ScenarioDiagnosis>(text) : null;
  if (parsed?.diagnosis && parsed.remedies?.length) {
    return {
      ...parsed,
      suggestedStaff: parsed.suggestedStaff ?? topStaff?.staffName ?? null,
    };
  }

  return fallbackDiagnoseScenario(scenarioText, analysis, guestContext);
}

function fallbackAnalyzeScenario(
  scenarioText: string,
  ctx: Record<string, unknown>
): ScenarioAnalysis {
  const lower = scenarioText.toLowerCase();

  if (ctx.propertyWide || lower.includes("[property-wide]")) {
    const urgency = /disaster|fire|flood|earthquake|evacuation|emergency/i.test(lower)
      ? "high"
      : "medium";
    return {
      eventType: "operational",
      urgency,
      analysis: `Property-wide event with individualized guest impact. ${ctx.name} may require tailored communication given their ${ctx.archetype || "profile"} and ${ctx.loyaltyTier} status.`,
    };
  }

  let eventType: ScenarioAnalysis["eventType"] = "neutral";
  if (
    /complaint|angry|upset|delay|wrong|billing|cold|dirty|rude|disappoint|frustrat|issue|problem/.test(lower)
  ) {
    eventType = "complaint";
  } else if (
    /thank|wonderful|excellent|compliment|amazing|love|perfect|grateful|appreciate|outstanding/.test(lower)
  ) {
    eventType = "compliment";
  } else if (/flight|arrival|room|spa|reservation|check/.test(lower)) {
    eventType = "operational";
  }

  const liveSignals = (ctx.liveSignals as unknown[]) ?? [];
  const hasPriorComplaints = liveSignals.some(
    (s) => (s as { eventType?: string }).eventType === "complaint"
  );

  let urgency: ScenarioAnalysis["urgency"] =
    eventType === "complaint" && ctx.riskLevel === "elevated"
      ? "high"
      : eventType === "complaint"
        ? "medium"
        : "low";

  if (eventType === "complaint" && hasPriorComplaints) {
    urgency = "high";
  }

  const patternNote =
    liveSignals.length > 0
      ? ` Builds on ${liveSignals.length} prior live signal(s) for this guest.`
      : "";

  return {
    eventType,
    urgency,
    analysis: `Live ${eventType} signal for ${ctx.name}: "${scenarioText.slice(0, 120)}${scenarioText.length > 120 ? "…" : ""}". Review guest memory and prior live signals.${patternNote}`,
  };
}

function fallbackDiagnoseScenario(
  scenarioText: string,
  analysis: ScenarioAnalysis,
  ctx: Record<string, unknown>
): ScenarioDiagnosis {
  const affinities = (ctx.affinities as Array<{ staffName: string; role: string }>) ?? [];
  const suggestedStaff = affinities[0]?.staffName ?? null;

  if (analysis.eventType === "operational" && (ctx.propertyWide || scenarioText.includes("[Property-wide]"))) {
    return {
      diagnosis: `Coordinate property-wide response for ${ctx.name}. Prioritize clear proactive communication and alternative arrangements aligned with their preferences.`,
      handlingTone: "calm orchestration",
      suggestedStaff,
      remedies: [
        {
          action: "proactive_guest_outreach",
          reason: "Property incident requires individualized update before guest inquires.",
          priority: analysis.urgency === "high" ? "high" : "medium",
          assignTo: suggestedStaff ?? undefined,
        },
        {
          action: "offer_alternative_amenity",
          reason: "Mitigate impact of property limitation with suitable substitute experience.",
          priority: "medium",
          assignTo: suggestedStaff ?? undefined,
        },
      ],
    };
  }

  if (analysis.eventType === "compliment") {
    return {
      diagnosis:
        "Acknowledge warmly but discreetly. Reinforce the positive experience without drawing excessive attention — align with guest preference for privacy.",
      handlingTone: "warm acknowledgment",
      suggestedStaff,
      remedies: [
        {
          action: "personalized_acknowledgment",
          reason: "Guest expressed satisfaction — a sincere note from leadership reinforces loyalty.",
          priority: "medium",
          assignTo: suggestedStaff ?? undefined,
        },
        {
          action: "memory_update",
          reason: "Record delight trigger in guest memory for future stays.",
          priority: "low",
        },
      ],
    };
  }

  const pending = (ctx.pendingRecommendations as Array<{ type: string }>) ?? [];
  const liveSignals = (ctx.liveSignals as unknown[]) ?? [];
  const hasDuplicateOutreach =
    pending.some((r) => /outreach|manager|recovery/i.test(r.type)) &&
    liveSignals.length > 0;

  if (analysis.eventType === "complaint") {
    const remedies: ScenarioRemedy[] = [];

    if (!hasDuplicateOutreach) {
      remedies.push({
        action: "manager_outreach",
        reason: `Scenario requires attentive handling: ${scenarioText.slice(0, 80)}`,
        priority: analysis.urgency === "high" ? "high" : "medium",
        assignTo: suggestedStaff ?? undefined,
      });
    } else {
      remedies.push({
        action: "escalated_recovery_follow_up",
        reason:
          "Prior live signals and pending outreach exist — coordinate a single senior follow-up to avoid repetitive contact.",
        priority: "high",
        assignTo: suggestedStaff ?? undefined,
      });
    }

    return {
      diagnosis:
        liveSignals.length > 0
          ? "Recurring service signal — treat as elevated recovery. Consolidate with prior live signals; one discreet, authoritative resolution path."
          : "Treat as service recovery priority. Address root cause promptly, avoid defensiveness, and offer a discreet remedy aligned with guest expectations.",
      handlingTone: "discreet recovery",
      suggestedStaff,
      remedies: [
        ...remedies,
        ...(ctx.riskLevel === "elevated"
          ? [
              {
                action: "proactive_folio_review",
                reason: "Guest has elevated risk profile — verify billing and charges.",
                priority: "high" as const,
              },
            ]
          : []),
        {
          action: "follow_up_before_checkout",
          reason: "Confirm resolution before departure to restore sentiment.",
          priority: "medium",
        },
      ],
    };
  }

  return {
    diagnosis:
      "Operational scenario — coordinate departments quietly and update arrival/orchestration timeline as needed.",
    handlingTone: "calm orchestration",
    suggestedStaff,
    remedies: [
      {
        action: "coordinate_operations",
        reason: scenarioText.slice(0, 100),
        priority: "medium",
        assignTo: suggestedStaff ?? undefined,
      },
    ],
  };
}

function fallbackNarrative(ctx: Record<string, unknown>): string {
  const archetype = (ctx.archetype as string) || "discerning traveler";
  const stays = (ctx.stayCount as number) || 1;
  return `A ${archetype.toLowerCase()} returning for stay ${stays}, valuing privacy and seamless service. Prioritize proactive communication and anticipate wellness-oriented preferences without over-engagement.`;
}

function fallbackRecommendations(
  ctx: Record<string, unknown>
): Array<{ type: string; reason: string; priority: string }> {
  const recs = [
    {
      type: "expedite_check_in",
      reason: "Guest values efficiency; prior friction around arrival timing.",
      priority: "medium",
    },
    {
      type: "assign_preferred_concierge",
      reason: "Strong affinity with prior concierge interactions.",
      priority: "medium",
    },
  ];

  if (ctx.riskLevel === "elevated") {
    recs.unshift({
      type: "proactive_folio_review",
      reason: "Previous billing resolution delay; review folio before checkout.",
      priority: "high",
    });
  }

  return recs;
}
