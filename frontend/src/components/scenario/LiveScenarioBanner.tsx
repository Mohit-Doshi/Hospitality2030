"use client";

import { useEffect, useState } from "react";
import { api, Scenario } from "@/lib/api";
import { ScenarioCard } from "./ScenarioCard";

export function LiveScenarioBanner({ guestId }: { guestId: string }) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  useEffect(() => {
    const load = () => {
      api
        .getScenarios({ guestId, status: "active" })
        .then(setScenarios)
        .catch(console.error);
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [guestId]);

  if (scenarios.length === 0) return null;

  return (
    <section className="mb-10 space-y-4">
      <p className="font-display text-xs uppercase tracking-[0.25em] text-[#8b5a4a]">
        Live signal · requires attention
      </p>
      {scenarios.map((s, i) => (
        <ScenarioCard key={s.id} scenario={s} index={i} compact />
      ))}
    </section>
  );
}
