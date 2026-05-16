const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error || `API error: ${res.status}`
    );
  }

  return res.json();
}

export interface Recommendation {
  id: string;
  recommendationType: string;
  reason: string;
  priority: string;
  status?: string;
}

export interface ScenarioRemedy {
  action: string;
  reason: string;
  priority: string;
  assignTo?: string;
}

export interface PropertyScenarioResult {
  propertyEventId: string;
  guestCount: number;
  propertyAnalysis: {
    eventType: string;
    urgency: string;
    analysis: string;
  } | null;
  scenarios: Scenario[];
}

export interface Scenario {
  id: string;
  guestId: string;
  scenarioText: string;
  eventType: "complaint" | "compliment" | "neutral" | "operational";
  urgency: string;
  analysis: string | null;
  diagnosis: string | null;
  remedies: ScenarioRemedy[];
  suggestedStaff: string | null;
  status: string;
  scope?: string;
  propertyEventId?: string | null;
  createdAt: string;
  updatedAt: string;
  guest: {
    id: string;
    name: string;
    loyaltyTier: string;
    archetype: string | null;
    roomType: string | null;
    arrivalEta: string | null;
  };
}

export interface GuestSummary {
  id: string;
  name: string;
  loyaltyTier: string;
  archetype: string | null;
  sentimentScore: number;
  narrativeSummary: string | null;
  arrivalEta: string | null;
  stayCount: number;
  riskLevel: string;
  delightOpportunity: string | null;
  checkIn: string | null;
  roomType: string | null;
  flightStatus: string | null;
  recommendations?: Recommendation[];
  incidents?: { category: string; severity: string }[];
}

export interface GuestDetail extends GuestSummary {
  email: string | null;
  checkOut: string | null;
  stays: {
    id: string;
    property: string;
    roomType: string | null;
    checkIn: string;
    checkOut: string;
    satisfactionScore: number | null;
    notes: string | null;
  }[];
  interactions: {
    id: string;
    interactionType: string;
    sentiment: number;
    notes: string | null;
    staff: { name: string; role: string } | null;
  }[];
  incidents: {
    id: string;
    category: string;
    severity: string;
    resolutionStatus: string;
    recoveryNotes: string | null;
  }[];
  recommendations: Recommendation[];
  affinities: {
    id: string;
    affinityScore: number;
    notes: string | null;
    staff: { id: string; name: string; role: string };
  }[];
  memories: {
    id: string;
    category: string;
    content: string;
    emotional: string | null;
  }[];
  orchestrationEvents: {
    id: string;
    timelineOffset: string;
    title: string;
    description: string | null;
    eventType: string;
  }[];
  scenarios?: Scenario[];
}

export interface ServiceIncident {
  id: string;
  category: string;
  severity: string;
  resolutionStatus: string;
  recoveryNotes: string | null;
  guest: {
    id: string;
    name: string;
    loyaltyTier: string;
    sentimentScore: number;
  };
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string | null;
  avatarInitials: string | null;
  affinities: {
    affinityScore: number;
    notes: string | null;
    guest: { id: string; name: string; loyaltyTier: string; arrivalEta: string | null };
  }[];
}

export const api = {
  getArrivals: () => fetchApi<GuestSummary[]>("/guests"),
  getAllGuests: () => fetchApi<GuestSummary[]>("/guests/all"),
  getGuest: (id: string) => fetchApi<GuestDetail>(`/guests/${id}`),
  regenerateGuest: (id: string) =>
    fetchApi<{ guest: GuestSummary; recommendations: Recommendation[] }>(
      `/guests/${id}/regenerate`,
      { method: "POST" }
    ),
  simulateFlightDelay: (id: string, arrivalEta?: string) =>
    fetchApi<GuestSummary>(`/guests/${id}/flight-delay`, {
      method: "PATCH",
      body: JSON.stringify({ arrivalEta }),
    }),
  getRecovery: () => fetchApi<ServiceIncident[]>("/recovery"),
  getStaff: () => fetchApi<StaffMember[]>("/staff"),
  getOrchestration: () =>
    fetchApi<
      {
        id: string;
        timelineOffset: string;
        title: string;
        description: string | null;
        eventType: string;
        guest: { id: string; name: string };
      }[]
    >("/orchestration"),
  getScenarios: (params?: { guestId?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.guestId) q.set("guestId", params.guestId);
    if (params?.status) q.set("status", params.status);
    const query = q.toString();
    return fetchApi<Scenario[]>(`/scenarios${query ? `?${query}` : ""}`);
  },
  getScenario: (id: string) => fetchApi<Scenario>(`/scenarios/${id}`),
  submitScenario: (guestId: string, scenarioText: string) =>
    fetchApi<Scenario>("/scenarios", {
      method: "POST",
      body: JSON.stringify({ guestId, scenarioText }),
    }),
  submitPropertyScenario: (scenarioText: string) =>
    fetchApi<PropertyScenarioResult>("/scenarios/property", {
      method: "POST",
      body: JSON.stringify({ scenarioText }),
    }),
  acknowledgeScenario: (id: string) =>
    fetchApi<Scenario>(`/scenarios/${id}/acknowledge`, { method: "PATCH" }),
};
