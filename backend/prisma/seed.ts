import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const today = new Date();
today.setHours(14, 0, 0, 0);

const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 2);

async function main() {
  await prisma.orchestrationEvent.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.staffAffinity.deleteMany();
  await prisma.interaction.deleteMany();
  await prisma.serviceIncident.deleteMany();
  await prisma.guestMemory.deleteMany();
  await prisma.stay.deleteMany();
  await prisma.guest.deleteMany();
  await prisma.staff.deleteMany();

  const elena = await prisma.staff.create({
    data: {
      name: "Elena Vasquez",
      role: "Head Concierge",
      department: "Concierge",
      avatarInitials: "EV",
    },
  });

  const marcus = await prisma.staff.create({
    data: {
      name: "Marcus Chen",
      role: "Front Desk Manager",
      department: "Front Office",
      avatarInitials: "MC",
    },
  });

  const sofia = await prisma.staff.create({
    data: {
      name: "Sofia Nakamura",
      role: "Spa Director",
      department: "Spa",
      avatarInitials: "SN",
    },
  });

  const james = await prisma.staff.create({
    data: {
      name: "James Whitfield",
      role: "Director of Rooms",
      department: "Housekeeping",
      avatarInitials: "JW",
    },
  });

  const guest1 = await prisma.guest.create({
    data: {
      name: "Alexandra Hartwell",
      email: "a.hartwell@example.com",
      loyaltyTier: "Elite",
      archetype: "Restorative Executive",
      sentimentScore: 0.82,
      narrativeSummary:
        "Frequent restorative traveler prioritizing efficiency, privacy, and wellness-oriented experiences. Previous frustration around delayed check-in. Strong positive sentiment toward spa and quiet dining.",
      arrivalEta: "15:30",
      stayCount: 7,
      riskLevel: "low",
      delightOpportunity: "Anniversary stay — discreet amenity preparation",
      checkIn: today,
      checkOut: tomorrow,
      roomType: "Premier King with Garden View",
      flightStatus: "on_time",
    },
  });

  const guest2 = await prisma.guest.create({
    data: {
      name: "David & Catherine Morrison",
      email: "morrison.family@example.com",
      loyaltyTier: "Signature",
      archetype: "Family Memory Builder",
      sentimentScore: 0.91,
      narrativeSummary:
        "Returning family guests who value tradition and child-oriented experiences. Appreciate proactive itinerary suggestions and continuity with familiar staff.",
      arrivalEta: "16:45",
      stayCount: 4,
      riskLevel: "low",
      delightOpportunity: "Prepare connecting rooms with children's amenities",
      checkIn: today,
      checkOut: tomorrow,
      roomType: "Two-Bedroom Suite",
      flightStatus: "on_time",
    },
  });

  const guest3 = await prisma.guest.create({
    data: {
      name: "Richard Pemberton",
      email: "r.pemberton@example.com",
      loyaltyTier: "Elite",
      archetype: "Status Sensitive VIP",
      sentimentScore: 0.68,
      narrativeSummary:
        "High-touch guest with elevated service expectations. Prior billing resolution delay requires proactive folio attention. Values continuity and discreet escalation handling.",
      arrivalEta: "14:00",
      stayCount: 12,
      riskLevel: "elevated",
      delightOpportunity: "Assign preferred concierge; avoid upsell language",
      checkIn: today,
      checkOut: tomorrow,
      roomType: "Rosewood Suite",
      flightStatus: "on_time",
    },
  });

  const guest4 = await prisma.guest.create({
    data: {
      name: "Yuki Tanaka",
      email: "y.tanaka@example.com",
      loyaltyTier: "Member",
      archetype: "Cultural Explorer",
      sentimentScore: 0.88,
      narrativeSummary:
        "Curious traveler seeking local dining and cultural experiences. Responds well to concierge-led itineraries and chef's table introductions.",
      arrivalEta: "17:15",
      stayCount: 2,
      riskLevel: "low",
      delightOpportunity: "Reserve Madera tasting menu; share gallery opening",
      checkIn: today,
      checkOut: tomorrow,
      roomType: "Deluxe King",
      flightStatus: "on_time",
    },
  });

  const guests = [guest1, guest2, guest3, guest4];

  for (const g of guests) {
    await prisma.stay.createMany({
      data: [
        {
          guestId: g.id,
          property: "Rosewood Sand Hill",
          roomType: g.roomType ?? undefined,
          checkIn: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000),
          checkOut: new Date(today.getTime() - 87 * 24 * 60 * 60 * 1000),
          satisfactionScore: 0.85,
          notes: "Quiet stay; appreciated late checkout.",
        },
        {
          guestId: g.id,
          property: "Rosewood Sand Hill",
          roomType: g.roomType ?? undefined,
          checkIn: today,
          checkOut: tomorrow,
          satisfactionScore: null,
        },
      ],
    });
  }

  await prisma.guestMemory.createMany({
    data: [
      {
        guestId: guest1.id,
        category: "emotional",
        content:
          "Values quiet restorative stays; dislikes operational delays; responds positively to proactive communication.",
        emotional: "calm, efficiency-oriented",
      },
      {
        guestId: guest1.id,
        category: "preference",
        content: "Prefers sparkling water, low lighting, spa before dinner.",
      },
      {
        guestId: guest3.id,
        category: "friction",
        content: "Previous delayed billing resolution — sensitivity to checkout process.",
        emotional: "cautious, expectation-sensitive",
      },
      {
        guestId: guest2.id,
        category: "tradition",
        content: "Annual holiday stay; children enjoy cookie turndown ritual.",
        emotional: "warm, family-centered",
      },
    ],
  });

  await prisma.staffAffinity.createMany({
    data: [
      {
        guestId: guest1.id,
        staffId: elena.id,
        affinityScore: 0.94,
        notes: "Exceptionally positive concierge interactions across two stays.",
      },
      {
        guestId: guest1.id,
        staffId: sofia.id,
        affinityScore: 0.88,
        notes: "Preferred spa therapist; restorative treatments.",
      },
      {
        guestId: guest3.id,
        staffId: marcus.id,
        affinityScore: 0.79,
        notes: "Trusted front desk rapport; handles escalations calmly.",
      },
      {
        guestId: guest4.id,
        staffId: elena.id,
        affinityScore: 0.91,
        notes: "Curated local experiences with high satisfaction.",
      },
    ],
  });

  await prisma.interaction.createMany({
    data: [
      {
        guestId: guest1.id,
        staffId: elena.id,
        interactionType: "concierge",
        sentiment: 0.95,
        notes: "Curated private vineyard visit; guest expressed deep appreciation.",
      },
      {
        guestId: guest3.id,
        staffId: marcus.id,
        interactionType: "front_desk",
        sentiment: 0.72,
        notes: "Billing inquiry required manager involvement; resolved same day.",
      },
    ],
  });

  await prisma.serviceIncident.createMany({
    data: [
      {
        guestId: guest3.id,
        category: "billing_dispute",
        severity: "medium",
        resolutionStatus: "monitoring",
        recoveryNotes:
          "Recommend proactive folio review before checkout. Offer discreet acknowledgment if guest raises prior incident.",
      },
      {
        guestId: guest1.id,
        category: "delayed_room_ready",
        severity: "low",
        resolutionStatus: "resolved",
        recoveryNotes: "Complimentary spa access provided; guest sentiment recovered.",
      },
    ],
  });

  await prisma.recommendation.createMany({
    data: [
      {
        guestId: guest1.id,
        recommendationType: "expedite_check_in",
        reason: "Elite guest with efficiency preference; room ready early.",
        priority: "high",
      },
      {
        guestId: guest1.id,
        recommendationType: "anniversary_amenity",
        reason: "Anniversary occasion noted in reservation — discreet preparation.",
        priority: "medium",
      },
      {
        guestId: guest3.id,
        recommendationType: "proactive_folio_review",
        reason: "Prior billing friction; review folio before guest requests.",
        priority: "high",
      },
      {
        guestId: guest3.id,
        recommendationType: "assign_preferred_concierge",
        reason: "Continuity reduces escalation risk for status-sensitive guest.",
        priority: "high",
      },
      {
        guestId: guest4.id,
        recommendationType: "reserve_spa_slot",
        reason: "Repeat spa booking pattern on day two of prior stay.",
        priority: "medium",
      },
    ],
  });

  await prisma.orchestrationEvent.createMany({
    data: [
      {
        guestId: guest1.id,
        timelineOffset: "T-24h",
        title: "Reservation confirmed",
        description: "Narrative and archetype generated from memory graph.",
        eventType: "system",
      },
      {
        guestId: guest1.id,
        timelineOffset: "T-12h",
        title: "Room prep initiated",
        description: "Wellness amenities and low lighting per preferences.",
        eventType: "action",
      },
      {
        guestId: guest1.id,
        timelineOffset: "T-3h",
        title: "Preferred concierge notified",
        description: "Elena briefed on arrival narrative.",
        eventType: "action",
      },
      {
        guestId: guest1.id,
        timelineOffset: "Arrival",
        title: "Expedited check-in enabled",
        description: "Front desk prepared with narrative summary.",
        eventType: "action",
      },
    ],
  });

  console.log("Seed complete:", guests.length, "arrivals,", 4, "staff");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
