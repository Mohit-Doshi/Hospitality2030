import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { buildGuestContext } from "../lib/guestContext.js";
import { processScenarioForGuest, processPropertyWideScenario } from "../services/scenarioProcessor.js";

export const scenariosRouter = Router();

scenariosRouter.get("/", async (req, res) => {
  const { guestId, status, propertyEventId } = req.query;

  const scenarios = await prisma.scenario.findMany({
    where: {
      ...(guestId && typeof guestId === "string" ? { guestId } : {}),
      ...(status && typeof status === "string" ? { status } : {}),
      ...(propertyEventId && typeof propertyEventId === "string"
        ? { propertyEventId }
        : {}),
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

scenariosRouter.post("/property", async (req, res) => {
  const { scenarioText } = req.body as { scenarioText?: string };

  if (!scenarioText?.trim()) {
    res.status(400).json({ error: "scenarioText is required" });
    return;
  }

  const result = await processPropertyWideScenario(scenarioText);

  res.status(201).json({
    propertyEventId: result.propertyEventId,
    guestCount: result.guestCount,
    propertyAnalysis: result.propertyAnalysis,
    scenarios: result.scenarios.map(formatScenario),
  });
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

  const scenario = await processScenarioForGuest(guestId, scenarioText.trim());
  if (!scenario) {
    res.status(404).json({ error: "Guest not found" });
    return;
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
    scope: string;
    propertyEventId: string | null;
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
