import { prisma } from "./prisma.js";

export type BuildGuestContextOptions = {
  /** Exclude a scenario (e.g. when re-processing) */
  excludeScenarioId?: string;
  /** Include other guests' scenarios from the same property-wide event */
  propertyEventId?: string;
};

export async function buildGuestContext(
  guestId: string,
  options?: BuildGuestContextOptions
) {
  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    include: {
      memories: true,
      incidents: true,
      affinities: { include: { staff: true }, orderBy: { affinityScore: "desc" } },
      recommendations: {
        take: 10,
        orderBy: { generatedAt: "desc" },
      },
      stays: { take: 3, orderBy: { checkIn: "desc" } },
      scenarios: {
        where: options?.excludeScenarioId
          ? { id: { not: options.excludeScenarioId } }
          : undefined,
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!guest) return null;

  let relatedPropertySignals: Awaited<
    ReturnType<typeof mapScenarioForContext>
  >[] = [];

  if (options?.propertyEventId) {
    const related = await prisma.scenario.findMany({
      where: {
        propertyEventId: options.propertyEventId,
        guestId: { not: guestId },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        guest: { select: { name: true } },
      },
    });
    relatedPropertySignals = related.map((s) => ({
      ...mapScenarioForContext(s),
      guestName: s.guest.name,
    }));
  }

  const liveSignals = guest.scenarios.map(mapScenarioForContext);
  const pendingRecommendations = guest.recommendations
    .filter((r) => r.status === "pending")
    .map((r) => ({
      type: r.recommendationType,
      reason: r.reason,
      priority: r.priority,
      fromLiveSignal: Boolean(r.scenarioId),
    }));

  const historicRecommendations = guest.recommendations
    .filter((r) => r.status !== "pending")
    .slice(0, 5)
    .map((r) => ({
      type: r.recommendationType,
      reason: r.reason,
      priority: r.priority,
    }));

  return {
    name: guest.name,
    loyaltyTier: guest.loyaltyTier,
    archetype: guest.archetype,
    sentimentScore: guest.sentimentScore,
    stayCount: guest.stayCount,
    riskLevel: guest.riskLevel,
    roomType: guest.roomType,
    narrativeSummary: guest.narrativeSummary,
    memories: guest.memories.map((m) => ({
      category: m.category,
      content: m.content,
      emotional: m.emotional,
    })),
    incidents: guest.incidents.map((i) => ({
      category: i.category,
      severity: i.severity,
      resolutionStatus: i.resolutionStatus,
      recoveryNotes: i.recoveryNotes,
    })),
    affinities: guest.affinities.map((a) => ({
      staffName: a.staff.name,
      role: a.staff.role,
      affinityScore: a.affinityScore,
      notes: a.notes,
    })),
    recentStays: guest.stays.map((s) => ({
      property: s.property,
      satisfactionScore: s.satisfactionScore,
    })),
    liveSignals,
    relatedPropertySignals,
    pendingRecommendations,
    historicRecommendations,
  };
}

function mapScenarioForContext(s: {
  id: string;
  scenarioText: string;
  eventType: string;
  urgency: string;
  analysis: string | null;
  diagnosis: string | null;
  status: string;
  scope: string;
  createdAt: Date;
}) {
  return {
    scenarioText: s.scenarioText,
    eventType: s.eventType,
    urgency: s.urgency,
    analysis: s.analysis,
    diagnosis: s.diagnosis,
    status: s.status,
    scope: s.scope,
    reportedAt: s.createdAt.toISOString(),
  };
}

export type GuestContext = NonNullable<Awaited<ReturnType<typeof buildGuestContext>>>;
