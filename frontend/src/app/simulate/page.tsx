"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle2, Building2, User } from "lucide-react";
import { api, GuestSummary, Scenario, PropertyScenarioResult } from "@/lib/api";
import { ScenarioCard } from "@/components/scenario/ScenarioCard";
import { PageHeader } from "@/components/guest/PageHeader";
import { cn } from "@/lib/utils";

const GUEST_EXAMPLES = [
  "Guest mentioned the room was not ready for 40 minutes after arrival.",
  "Guest loved the spa treatment and asked to thank Sofia personally.",
  "Flight delayed 3 hours — guest arriving after dinner service ends.",
  "Guest upset about incorrect minibar charges on folio.",
];

const PROPERTY_EXAMPLES = [
  "Property-wide WiFi outage affecting all guest rooms and business center.",
  "Swimming pool closed for emergency repairs through weekend.",
  "Gym temporarily unavailable due to equipment safety inspection.",
  "Regional power instability — backup generators active, spa hours adjusted.",
  "Severe weather advisory — outdoor dining and terrace experiences cancelled.",
];

type Mode = "guest" | "property";

export default function SimulatePage() {
  const [mode, setMode] = useState<Mode>("guest");
  const [guests, setGuests] = useState<GuestSummary[]>([]);
  const [guestId, setGuestId] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Scenario | null>(null);
  const [propertyResult, setPropertyResult] = useState<PropertyScenarioResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getAllGuests().then((g) => {
      setGuests(g);
      if (g[0]) setGuestId(g[0].id);
    });
  }, []);

  function switchMode(next: Mode) {
    setMode(next);
    setText("");
    setResult(null);
    setPropertyResult(null);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    if (mode === "guest" && !guestId) return;

    setSubmitting(true);
    setError(null);
    setResult(null);
    setPropertyResult(null);

    try {
      if (mode === "property") {
        setPropertyResult(await api.submitPropertyScenario(text.trim()));
      } else {
        setResult(await api.submitScenario(guestId, text.trim()));
      }
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit scenario");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedGuest = guests.find((g) => g.id === guestId);
  const examples = mode === "property" ? PROPERTY_EXAMPLES : GUEST_EXAMPLES;

  return (
    <SimulatePageView
      mode={mode}
      switchMode={switchMode}
      guests={guests}
      guestId={guestId}
      setGuestId={setGuestId}
      selectedGuest={selectedGuest}
      text={text}
      setText={setText}
      submitting={submitting}
      result={result}
      propertyResult={propertyResult}
      error={error}
      examples={examples}
      handleSubmit={handleSubmit}
    />
  );
}

function SimulatePageView(props: {
  mode: Mode;
  switchMode: (m: Mode) => void;
  guests: GuestSummary[];
  guestId: string;
  setGuestId: (id: string) => void;
  selectedGuest?: GuestSummary;
  text: string;
  setText: (t: string) => void;
  submitting: boolean;
  result: Scenario | null;
  propertyResult: PropertyScenarioResult | null;
  error: string | null;
  examples: string[];
  handleSubmit: (e: React.FormEvent) => void;
}) {
  const {
    mode,
    switchMode,
    guests,
    guestId,
    setGuestId,
    selectedGuest,
    text,
    setText,
    submitting,
    result,
    propertyResult,
    error,
    examples,
    handleSubmit,
  } = props;

  return (
    <div className="fade-in min-h-screen bg-charcoal/[0.02] px-12 py-14">
      <SimulatePageBadge />
      <PageHeader
        title="Simulate Scenarios"
        subtitle={
          mode === "property"
            ? "Inject a property-wide event — intelligence personalizes for every in-house guest."
            : "Inject a live signal for one guest — flows to the staff console in real time."
        }
      />

      <div className="mb-8 flex gap-2">
        <ModeTab
          active={mode === "guest"}
          onClick={() => switchMode("guest")}
          icon={<User className="h-3.5 w-3.5" />}
          label="Single guest"
        />
        <ModeTab
          active={mode === "property"}
          onClick={() => switchMode("property")}
          icon={<Building2 className="h-3.5 w-3.5" />}
          label="Property-wide"
        />
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 border border-divider bg-surface p-8"
        >
          {mode === "guest" ? (
            <>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-charcoal-soft">
                  Select guest
                </label>
                <select
                  value={guestId}
                  onChange={(e) => setGuestId(e.target.value)}
                  className="mt-2 w-full border border-divider bg-ivory px-4 py-3 text-charcoal focus:border-gold focus:outline-none"
                >
                  {guests.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} · {g.loyaltyTier}
                    </option>
                  ))}
                </select>
              </div>
              {selectedGuest && (
                <p className="text-sm text-charcoal-soft">
                  {selectedGuest.archetype} · {selectedGuest.stayCount} stays · sentiment{" "}
                  {Math.round(selectedGuest.sentimentScore * 100)}%
                </p>
              )}
            </>
          ) : (
            <div className="border border-gold/30 bg-gold/5 p-4">
              <p className="text-[10px] uppercase tracking-widest text-gold">
                Affects all guests
              </p>
              <p className="mt-2 text-sm text-charcoal-soft">
                {guests.length} guest{guests.length !== 1 ? "s" : ""} will receive personalized
                analysis, diagnosis, and recommendations.
              </p>
            </div>
          )}

          <div>
            <label className="text-[10px] uppercase tracking-widest text-charcoal-soft">
              Scenario
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              placeholder={
                mode === "property"
                  ? "Describe the property-wide situation…"
                  : "Describe what just happened…"
              }
              className="mt-2 w-full resize-none border border-divider bg-ivory px-4 py-3 font-display text-lg text-charcoal placeholder:text-charcoal-soft/50 focus:border-gold focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {examples.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setText(ex)}
                className="border border-divider px-3 py-1.5 text-xs text-charcoal-soft hover:border-gold/40 transition-colors text-left"
              >
                {ex.slice(0, 48)}…
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={submitting || !text.trim() || (mode === "guest" && !guestId)}
            className="inline-flex w-full items-center justify-center gap-2 bg-charcoal py-3.5 text-xs uppercase tracking-widest text-ivory transition-colors hover:bg-gold disabled:opacity-50"
          >
            {submitting ? (
              mode === "property"
                ? `Analyzing for ${guests.length} guests…`
                : "Analyzing with intelligence layer…"
            ) : (
              <>
                <Send className="h-4 w-4" />
                {mode === "property" ? "Broadcast to all guests" : "Send to staff console"}
              </>
            )}
          </button>

          {error && <p className="text-sm text-[#8b5a4a]">{error}</p>}
        </form>

        <ResultPanel mode={mode} result={result} propertyResult={propertyResult} />
      </div>
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-widest transition-colors",
        active
          ? "bg-charcoal text-ivory"
          : "border border-divider text-charcoal-soft hover:border-gold/40"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function ResultPanel({
  mode,
  result,
  propertyResult,
}: {
  mode: Mode;
  result: Scenario | null;
  propertyResult: PropertyScenarioResult | null;
}) {
  if (propertyResult) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6 max-h-[80vh] overflow-y-auto pr-2"
      >
        <SuccessHeader
          label={`Property event live · ${propertyResult.guestCount} guests`}
        />
        {propertyResult.propertyAnalysis && (
          <PropertySummary analysis={propertyResult.propertyAnalysis} />
        )}
        <div className="space-y-4">
          {propertyResult.scenarios.map((s, i) => (
            <ScenarioCard key={s.id} scenario={s} index={i} compact />
          ))}
        </div>
        <p className="text-sm text-charcoal-soft">
          View all on{" "}
          <a href="/scenarios" className="text-gold underline">
            Live Signals
          </a>
        </p>
      </motion.div>
    );
  }

  if (result) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <SuccessHeader label="Scenario live on staff console" />
        <ScenarioCard scenario={result} />
        <p className="text-sm text-charcoal-soft">
          Open{" "}
          <a href="/scenarios" className="text-gold underline">
            Live Signals
          </a>{" "}
          or the guest profile to see staff-facing diagnosis.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="flex h-full min-h-[320px] items-center justify-center border border-dashed border-divider p-8 text-center">
      <p className="font-display text-lg text-charcoal-soft">
        {mode === "property"
          ? "Submit a property-wide event to generate personalized intelligence for every guest."
          : "Submit a scenario to analyze with guest memory, affinities, and recovery context."}
      </p>
    </div>
  );
}

function SuccessHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-gold">
      <CheckCircle2 className="h-5 w-5" />
      <p className="text-sm uppercase tracking-widest">{label}</p>
    </div>
  );
}

function PropertySummary({
  analysis,
}: {
  analysis: { eventType: string; urgency: string; analysis: string };
}) {
  return (
    <div className="border border-gold/40 bg-surface p-5">
      <p className="text-[10px] uppercase tracking-widest text-gold">Property briefing</p>
      <p className="mt-2 text-sm leading-relaxed text-charcoal">{analysis.analysis}</p>
      <p className="mt-2 text-xs uppercase tracking-widest text-charcoal-soft">
        {analysis.eventType} · {analysis.urgency} urgency
      </p>
    </div>
  );
}

function SimulatePageBadge() {
  return (
    <div className="mb-2 inline-block border border-gold/40 bg-gold/5 px-3 py-1">
      <p className="text-[10px] uppercase tracking-[0.25em] text-gold">
        Demo · Scenario Injector
      </p>
    </div>
  );
}
