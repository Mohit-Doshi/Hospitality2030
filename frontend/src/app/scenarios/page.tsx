"use client";

import { useCallback, useEffect, useState } from "react";
import { api, Scenario } from "@/lib/api";
import { ScenarioCard } from "@/components/scenario/ScenarioCard";
import { PageHeader } from "@/components/guest/PageHeader";

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"active" | "all">("active");

  const load = useCallback(() => {
    api
      .getScenarios(filter === "active" ? { status: "active" } : undefined)
      .then(setScenarios)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  async function handleAcknowledge(id: string) {
    await api.acknowledgeScenario(id);
    load();
  }

  const activeCount = scenarios.filter((s) => s.status === "active").length;

  return (
    <div className="fade-in px-12 py-14">
      <PageHeader
        title="Live Signals"
        subtitle="Real-time guest scenarios — analyzed with memory, affinity, and recovery context."
        action={
          <FilterButtons
            filter={filter}
            setFilter={setFilter}
            activeCount={activeCount}
          />
        }
      />

      {loading && scenarios.length === 0 ? (
        <SkeletonList />
      ) : scenarios.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-6 max-w-4xl">
          {scenarios.map((s, i) => (
            <ScenarioCard
              key={s.id}
              scenario={s}
              index={i}
              onAcknowledge={handleAcknowledge}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterButtons({
  filter,
  setFilter,
  activeCount,
}: {
  filter: "active" | "all";
  setFilter: (f: "active" | "all") => void;
  activeCount: number;
}) {
  return (
    <div className="flex gap-2">
      {(["active", "all"] as const).map((f) => (
        <button
          key={f}
          onClick={() => setFilter(f)}
          className={`px-4 py-2 text-xs uppercase tracking-widest transition-colors ${
            filter === f
              ? "bg-charcoal text-ivory"
              : "border border-divider text-charcoal-soft hover:border-gold/40"
          }`}
        >
          {f === "active" ? `Active (${activeCount})` : "All"}
        </button>
      ))}
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-4 max-w-4xl">
      {[1, 2].map((i) => (
        <div key={i} className="skeleton h-48 border border-divider" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <p className="font-display text-lg text-charcoal-soft">
      No live signals. Use the{" "}
      <a href="/simulate" className="text-gold underline">
        Scenario Simulator
      </a>{" "}
      to inject a guest scenario.
    </p>
  );
}
