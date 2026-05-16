"use client";

import { useEffect, useState } from "react";
import { api, GuestSummary } from "@/lib/api";
import { GuestCard } from "@/components/guest/GuestCard";
import { PageHeader } from "@/components/guest/PageHeader";

export default function ArrivalsPage() {
  const [guests, setGuests] = useState<GuestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "risk" | "elite">("all");

  useEffect(() => {
    api
      .getArrivals()
      .then(setGuests)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = guests.filter((g) => {
    if (filter === "risk") return g.riskLevel === "elevated";
    if (filter === "elite")
      return g.loyaltyTier === "Elite" || g.loyaltyTier === "Signature";
    return true;
  });

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="fade-in px-12 py-14">
      <PageHeader
        title="Today's Arrivals"
        subtitle={`${filtered.length} guests arriving · ${today}`}
        action={
          <div className="flex gap-2">
            {(["all", "elite", "risk"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-xs uppercase tracking-widest transition-colors duration-300 ${
                  filter === f
                    ? "bg-charcoal text-ivory"
                    : "border border-divider text-charcoal-soft hover:border-gold/40"
                }`}
              >
                {f === "all" ? "All" : f === "elite" ? "VIP" : "Attentive"}
              </button>
            ))}
          </div>
        }
      />

      {loading ? (
        <SkeletonGrid />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {filtered.map((guest, i) => (
            <GuestCard key={guest.id} guest={guest} index={i} />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <p className="font-display text-lg text-charcoal-soft">
          No arrivals match this filter.
        </p>
      )}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="skeleton h-64 border border-divider" />
      ))}
    </div>
  );
}
