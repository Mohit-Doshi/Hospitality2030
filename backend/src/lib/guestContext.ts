import { prisma } from "./prisma.js";

export async function buildGuestContext(guestId: string) {
  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    include: {
      memories: true,
      incidents: true,
      affinities: { include: { staff: true }, orderBy: { affinityScore: "desc" } },
      recommendations: { take: 5, orderBy: { generatedAt: "desc" } },
      stays: { take: 3, orderBy: { checkIn: "desc" } },
    },
  });

  if (!guest) return null;

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
  };
}

export type GuestContext = NonNullable<Awaited<ReturnType<typeof buildGuestContext>>>;
