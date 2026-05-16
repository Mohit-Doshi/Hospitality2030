"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle2 } from "lucide-react";
import { api, GuestSummary, Scenario } from "@/lib/api";
import { ScenarioCard } from "@/components/scenario/ScenarioCard";
import { PageHeader } from "@/components/guest/PageHeader";

const EXAMPLE_SCENARIOS = [
  "Guest mentioned the room was not ready for 40 minutes after arrival.",
  "Guest loved the spa treatment and asked to thank Sofia personally.",
  "Flight delayed 3 hours — guest arriving after dinner service ends.",
  "Guest upset about incorrect minibar charges on folio.",
];

export default function SimulatePage() {
  const [guests, setGuests] = useState<GuestSummary[]>([]);
  const [guestId, setGuestId] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Scenario | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getAllGuests().then((g) => {
      setGuests(g);
      if (g[0]) setGuestId(g[0].id);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!guestId || !text.trim()) return;

    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const scenario = await api.submitScenario(guestId, text.trim());
      setResult(scenario);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit scenario");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedGuest = guests.find((g) => g.id === guestId);

  return (
    <div className="fade-in min-h-screen bg-charcoal/[0.02] px-12 py-14">
      <SimulatePageBadge />
      <PageHeader
        title="Simulate Guest Scenario"
        subtitle="Inject a live signal — intelligence flows to the staff console in real time."
      />

      <div className="grid gap-10 lg:grid-cols-2">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 border border-divider bg-surface p-8"
        >
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

          <div>
            <label className="text-[10px] uppercase tracking-widest text-charcoal-soft">
              Scenario
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              placeholder="Describe what just happened…"
              className="mt-2 w-full resize-none border border-divider bg-ivory px-4 py-3 font-display text-lg text-charcoal placeholder:text-charcoal-soft/50 focus:border-gold focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {EXAMPLE_SCENARIOS.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setText(ex)}
                className="border border-divider px-3 py-1.5 text-xs text-charcoal-soft hover:border-gold/40 transition-colors"
              >
                {ex.slice(0, 42)}…
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="inline-flex w-full items-center justify-center gap-2 bg-charcoal py-3.5 text-xs uppercase tracking-widest text-ivory transition-colors hover:bg-gold disabled:opacity-50"
          >
            {submitting ? (
              "Analyzing with intelligence layer…"
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send to staff console
              </>
            )}
          </button>

          {error && <p className="text-sm text-[#8b5a4a]">{error}</p>}
        </form>

        <div className="space-y-6">
          {result ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mb-4 flex items-center gap-2 text-gold">
                <CheckCircle2 className="h-5 w-5" />
                <p className="text-sm uppercase tracking-widest">
                  Scenario live on staff console
                </p>
              </div>
              <ScenarioCard scenario={result} />
              <p className="mt-4 text-sm text-charcoal-soft">
                Open{" "}
                <a href="/scenarios" className="text-gold underline">
                  Live Signals
                </a>{" "}
                or the guest profile to see staff-facing diagnosis.
              </p>
            </motion.div>
          ) : (
            <div className="flex h-full min-h-[320px] items-center justify-center border border-dashed border-divider p-8 text-center">
              <p className="font-display text-lg text-charcoal-soft">
                Submit a scenario to analyze with guest memory, affinities, and recovery
                context.
              </p>
            </div>
          )}
        </div>
      </div>
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
