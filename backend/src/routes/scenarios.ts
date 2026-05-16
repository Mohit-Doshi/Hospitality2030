import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { buildGuestContext } from "../lib/guestContext.js";
import { analyzeScenario, diagnoseScenario } from "../services/ai.js";

export const scenariosRouter = Router();

scenariosRouter.get("/", async (req, res) => {
  const { guestId, status } = req.query;

  const scenarios = await prisma.scenario.findMany({
    where: {
      ...(guestId && typeof guestId === "string" ? { guestId } : {}),
      ...(status && typeof status === "string" ? { status } : {}),
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
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  res.json(scenarios.map(formatScenario));
});

scenariosRouter.get("/:id", async (req, res) => {
  const scenario = await prisma.scenario.findUnique({
    where: { id: req.params.id },
    include: {
      guest: {
        select: {
          id: true,
          name: true,
          loyaltyTier: true,
          archetype: true,
          roomType: true,
          arrivalEta: true,
          sentimentScore: true,
        },
      },
    },
  });

  if (!scenario) {
    res.status(404).json({ error: "Scenario not found" });
    return;
  }

  res.json(formatScenario(scenario));
});

scenariosRouter.post("/", async (req, res) => {
  const { guestId, scenarioText } = req.body as {
    guestId?: string;
    scenarioText?: string;
  };

  if (!guestId || !scenarioText?.trim()) {
    res.status(400).json({ error: "guestId and scenarioText are required" });
    return;
  }

  const guestContext = await buildGuestContext(guestId);
  if (!guestContext) {
    res.status(404).json({ error: "Guest not found" });
    return;
  }

  const analysis = await analyzeScenario(scenarioText.trim(), guestContext);
  const diagnosis = await diagnoseScenario(scenarioText.trim(), analysis, guestContext);

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
    analysis.eventType === "complaint"
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
      eventType: analysis.eventType === "complaint" ? "alert" : "signal",
    },
  });

  if (analysis.eventType === "complaint" && analysis.urgency !== "low") {
    await prisma.serviceIncident.create({
      data: {
        guestId,
        category: "live_scenario",
        severity: analysis.urgency,
        resolutionStatus: "open",
        recoveryNotes: diagnosis.diagnosis,
      },
    });
  }

  if (analysis.eventType === "compliment") {
    const newSentiment = Math.min(0.98, guestContext.sentimentScore + 0.03);
    await prisma.guest.update({
      where: { id: guestId },
      data: { sentimentScore: newSentiment },
    });
  } else if (analysis.eventType === "complaint" && analysis.urgency === "high") {
    const newSentiment = Math.max(0.4, guestContext.sentimentScore - 0.08);
    await prisma.guest.update({
      where: { id: guestId },
      data: { sentimentScore: newSentiment, riskLevel: "elevated" },
    });
  }

  res.status(201).json(formatScenario(scenario));
});

scenariosRouter.patch("/:id/acknowledge", async (req, res) => {
  const scenario = await prisma.scenario.update({
    where: { id: req.params.id },
    data: { status: "acknowledged" },
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

  res.json(formatScenario(scenario));
});

function formatScenario(
  scenario: {
    id: string;
    guestId: string;
    scenarioText: string;
    eventType: string;
    urgency: string;
    analysis: string | null;
    diagnosis: string | null;
    remedies: string | null;
    suggestedStaff: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    guest: {
      id: string;
      name: string;
      loyaltyTier: string;
      archetype: string | null;
      roomType: string | null;
      arrivalEta: string | null;
    };
  }
) {
  return {
    ...scenario,
    remedies: scenario.remedies ? JSON.parse(scenario.remedies) : [],
    createdAt: scenario.createdAt.toISOString(),
    updatedAt: scenario.updatedAt.toISOString(),
  };
}
