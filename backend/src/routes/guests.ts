import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { generateNarrative, generateRecommendations, classifyArchetype } from "../services/ai.js";

export const guestsRouter = Router();

guestsRouter.get("/", async (_req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const arrivals = await prisma.guest.findMany({
    where: {
      checkIn: { gte: today, lt: tomorrow },
    },
    include: {
      recommendations: { take: 3, orderBy: { generatedAt: "desc" } },
      incidents: { where: { resolutionStatus: { not: "resolved" } }, take: 1 },
    },
    orderBy: { arrivalEta: "asc" },
  });

  res.json(arrivals);
});

guestsRouter.get("/all", async (_req, res) => {
  const guests = await prisma.guest.findMany({
    include: {
      recommendations: { take: 2, orderBy: { generatedAt: "desc" } },
    },
    orderBy: { name: "asc" },
  });
  res.json(guests);
});

guestsRouter.get("/:id", async (req, res) => {
  const guest = await prisma.guest.findUnique({
    where: { id: req.params.id },
    include: {
      stays: { orderBy: { checkIn: "desc" } },
      interactions: {
        include: { staff: true },
        orderBy: { createdAt: "desc" },
      },
      incidents: { orderBy: { createdAt: "desc" } },
      recommendations: { orderBy: { generatedAt: "desc" } },
      affinities: {
        include: { staff: true },
        orderBy: { affinityScore: "desc" },
      },
      memories: { orderBy: { createdAt: "desc" } },
      orchestrationEvents: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!guest) {
    res.status(404).json({ error: "Guest not found" });
    return;
  }

  res.json(guest);
});

guestsRouter.post("/:id/regenerate", async (req, res) => {
  const guest = await prisma.guest.findUnique({
    where: { id: req.params.id },
    include: {
      stays: true,
      incidents: true,
      memories: true,
      affinities: { include: { staff: true } },
    },
  });

  if (!guest) {
    res.status(404).json({ error: "Guest not found" });
    return;
  }

  const context = {
    name: guest.name,
    loyaltyTier: guest.loyaltyTier,
    archetype: guest.archetype,
    stayCount: guest.stayCount,
    sentimentScore: guest.sentimentScore,
    riskLevel: guest.riskLevel,
    memories: guest.memories.map((m) => m.content),
    incidents: guest.incidents.map((i) => ({
      category: i.category,
      severity: i.severity,
    })),
  };

  const [narrative, archetype, recs] = await Promise.all([
    generateNarrative(context),
    classifyArchetype(context),
    generateRecommendations(context),
  ]);

  const updated = await prisma.guest.update({
    where: { id: guest.id },
    data: { narrativeSummary: narrative, archetype },
  });

  await prisma.recommendation.deleteMany({ where: { guestId: guest.id } });
  await prisma.recommendation.createMany({
    data: recs.map((r) => ({
      guestId: guest.id,
      recommendationType: r.type,
      reason: r.reason,
      priority: r.priority,
    })),
  });

  res.json({ guest: updated, recommendations: recs });
});

guestsRouter.patch("/:id/flight-delay", async (req, res) => {
  const guest = await prisma.guest.update({
    where: { id: req.params.id },
    data: {
      flightStatus: "delayed",
      arrivalEta: req.body.arrivalEta || "18:45",
    },
  });

  await prisma.orchestrationEvent.createMany({
    data: [
      {
        guestId: guest.id,
        timelineOffset: "T-12h",
        title: "Flight delay detected",
        description: "Arrival window shifted; room prep timeline adjusted.",
        eventType: "signal",
      },
      {
        guestId: guest.id,
        timelineOffset: "T-6h",
        title: "Room prep rescheduled",
        description: "Housekeeping aligned for later arrival.",
        eventType: "action",
      },
      {
        guestId: guest.id,
        timelineOffset: "T-2h",
        title: "Concierge notified",
        description: "Indoor wellness alternatives prepared.",
        eventType: "action",
      },
    ],
  });

  await prisma.recommendation.create({
    data: {
      guestId: guest.id,
      recommendationType: "adjust_check_in",
      reason: "Flight delay — offer lounge welcome and flexible dining reservation.",
      priority: "high",
    },
  });

  res.json(guest);
});
