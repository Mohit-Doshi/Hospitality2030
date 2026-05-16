import { randomUUID } from "crypto";
import { prisma } from "../lib/prisma.js";
import { buildGuestContext } from "../lib/guestContext.js";
import {
  analyzeScenario,
  diagnoseScenario,
  type ScenarioAnalysis,
} from "./ai.js";

export async function processScenarioForGuest(
  guestId: string,
  scenarioText: string,
  options?: {
    scope?: "guest" | "property";
    propertyEventId?: string;
    propertyBriefing?: string;
  }
) {
  const guestContext = await buildGuestContext(guestId);
  if (!guestContext) return null;

  const contextualText =
    options?.scope === "property" && options.propertyBriefing
      ? `[Property-wide] ${scenarioText}\n\nProperty briefing: ${options.propertyBriefing}`
      : scenarioText;

  const analysis = await analyzeScenario(contextualText, {
    ...guestContext,
    propertyWide: options?.scope === "property",
  });
  const diagnosis = await diagnoseScenario(
    contextualText,
    analysis,
    guestContext
  );

  const scenario = await prisma.scenario.create({
    data: {
      guestId,
      scenarioText: scenarioText.trim(),
      eventType: analysis.eventType,
      urgency: analysis.urgency,
      analysis: analysis.analysis,
      diagnosis: diagnosis.diagnosis,
      remedies: JSON.stringify(diagnosis.remedies),
      suggestedStaff: diagnosis.suggestedStaff,
      status: "active",
      scope: options?.scope ?? "guest",
      propertyEventId: options?.propertyEventId ?? null,
    },
    include: {
      guest: {
        select: {
          id: true,
          name: true,
          loyaltyTier: true,
          archetype: true,
          roomType: true,
          arrivalEta: true,
        },
      },
    },
  });

  await prisma.recommendation.createMany({
    data: diagnosis.remedies.map((r) => ({
      guestId,
      recommendationType: r.action,
      reason: r.reason,
      priority: r.priority,
      status: "pending",
      scenarioId: scenario.id,
    })),
  });

  const eventTitle =
    options?.scope === "property"
      ? "Property-wide event — guest impact assessed"
      : analysis.eventType === "complaint"
        ? "Service signal — recovery initiated"
        : analysis.eventType === "compliment"
          ? "Delight signal — acknowledgment recommended"
          : "Operational scenario received";

  await prisma.orchestrationEvent.create({
    data: {
      guestId,
      timelineOffset: "Live",
      title: eventTitle,
      description: analysis.analysis,
      eventType:
        options?.scope === "property" || analysis.eventType === "complaint"
          ? "alert"
          : "signal",
    },
  });

  if (analysis.eventType === "complaint" && analysis.urgency !== "low") {
    await prisma.serviceIncident.create({
      data: {
        guestId,
        category: options?.scope === "property" ? "property_incident" : "live_scenario",
        severity: analysis.urgency,
        resolutionStatus: "open",
        recoveryNotes: diagnosis.diagnosis,
      },
    });
  }

  if (analysis.eventType === "compliment") {
    await prisma.guest.update({
      where: { id: guestId },
      data: {
        sentimentScore: Math.min(0.98, guestContext.sentimentScore + 0.03),
      },
    });
  } else if (
    (analysis.eventType === "complaint" && analysis.urgency === "high") ||
    (options?.scope === "property" && analysis.urgency !== "low")
  ) {
    await prisma.guest.update({
      where: { id: guestId },
      data: {
        sentimentScore: Math.max(0.4, guestContext.sentimentScore - 0.05),
        ...(analysis.urgency === "high" ? { riskLevel: "elevated" } : {}),
      },
    });
  }

  return scenario;
}

export async function processPropertyWideScenario(scenarioText: string) {
  const trimmed = scenarioText.trim();
  const propertyEventId = randomUUID();

  const guests = await prisma.guest.findMany({
    orderBy: { name: "asc" },
  });

  if (guests.length === 0) {
    return { propertyEventId, guestCount: 0, propertyAnalysis: null, scenarios: [] };
  }

  const propertyAnalysis: ScenarioAnalysis = {
    eventType: "operational",
    urgency: /disaster|fire|flood|earthquake|evacuation|emergency/i.test(trimmed)
      ? "high"
      : /wifi|internet|pool|gym|elevator|power|water/i.test(trimmed)
        ? "medium"
        : "medium",
    analysis: `Property-wide operational event affecting all in-house guests: ${trimmed}. Individual guest responses should reflect archetype, loyalty tier, and prior service context.`,
  };

  const results = await Promise.all(
    guests.map((g) =>
      processScenarioForGuest(g.id, trimmed, {
        scope: "property",
        propertyEventId,
        propertyBriefing: propertyAnalysis.analysis,
      })
    )
  );

  return {
    propertyEventId,
    guestCount: guests.length,
    propertyAnalysis,
    scenarios: results.filter(Boolean),
  };
}
