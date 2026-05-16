import Anthropic from "@anthropic-ai/sdk";

const client = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const LUXURY_SYSTEM = `You are the hospitality intelligence layer for Rosewood Sand Hill, a luxury hotel.
Write in a calm, discreet, concierge-like tone. Avoid robotic phrasing, excessive enthusiasm, corporate jargon, and surveillance language.
Abstract insights into service-oriented hospitality language. Never include raw PII or creepy personalization.
Keep responses concise and operationally useful for hotel staff.`;

export async function generateNarrative(guestContext: Record<string, unknown>): Promise<string> {
  if (!client) {
    return fallbackNarrative(guestContext);
  }

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      system: LUXURY_SYSTEM,
      messages: [
        {
          role: "user",
          content: `Generate a 2-3 sentence hospitality guest narrative for staff briefing. Context:\n${JSON.stringify(guestContext, null, 2)}`,
        },
      ],
    });

    const block = message.content[0];
    if (block.type === "text") return block.text.trim();
  } catch {
    /* fall through */
  }

  return fallbackNarrative(guestContext);
}

export async function generateRecommendations(
  guestContext: Record<string, unknown>
): Promise<Array<{ type: string; reason: string; priority: string }>> {
  if (!client) {
    return fallbackRecommendations(guestContext);
  }

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: LUXURY_SYSTEM,
      messages: [
        {
          role: "user",
          content: `Return JSON array of 3-5 operational recommendations. Each item: { "type": string, "reason": string, "priority": "high"|"medium"|"low" }. Context:\n${JSON.stringify(guestContext, null, 2)}`,
        },
      ],
    });

    const block = message.content[0];
    if (block.type === "text") {
      const match = block.text.match(/\[[\s\S]*\]/);
      if (match) return JSON.parse(match[0]);
    }
  } catch {
    /* fall through */
  }

  return fallbackRecommendations(guestContext);
}

export async function classifyArchetype(
  guestContext: Record<string, unknown>
): Promise<string> {
  if (!client) {
    return (guestContext.archetype as string) || "Restorative Executive";
  }

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 50,
      system: LUXURY_SYSTEM,
      messages: [
        {
          role: "user",
          content: `Classify into ONE archetype: Restorative Executive, Cultural Explorer, Status Sensitive VIP, or Family Memory Builder. Reply with only the archetype name. Context:\n${JSON.stringify(guestContext, null, 2)}`,
        },
      ],
    });

    const block = message.content[0];
    if (block.type === "text") return block.text.trim();
  } catch {
    /* fall through */
  }

  return "Restorative Executive";
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
      priority: "high",
    },
    {
      type: "prewarm_room",
      reason: "Restorative stay pattern suggests early room readiness.",
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
