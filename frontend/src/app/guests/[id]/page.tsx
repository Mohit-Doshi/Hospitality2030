"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Plane } from "lucide-react";
import { api, GuestDetail } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import {
  cn,
  formatSentiment,
  priorityBadgeVariant,
  resolutionBadgeVariant,
  sentimentColor,
  severityBadgeVariant,
  severityBoxClass,
} from "@/lib/utils";
import { LiveScenarioBanner } from "@/components/scenario/LiveScenarioBanner";

export default function GuestProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const [guest, setGuest] = useState<GuestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api
      .getGuest(id)
      .then(setGuest)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRegenerate() {
    setActionLoading(true);
    try {
      await api.regenerateGuest(id);
      load();
    } finally {
      setActionLoading(false);
    }
  }

  async function handleFlightDelay() {
    setActionLoading(true);
    try {
      await api.simulateFlightDelay(id, "18:45");
      load();
    } finally {
      setActionLoading(false);
    }
  }

  if (loading || !guest) {
    return (
      <LoadingShell />
    );
  }

  return (
    <div className="fade-in px-12 py-14">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-charcoal-soft transition-colors hover:text-gold"
      >
        <ArrowLeft className="h-4 w-4" />
        Arrivals
      </Link>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <header className="border-b border-divider pb-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="font-display text-xs uppercase tracking-[0.25em] text-gold">
                Guest Story
              </p>
              <h1 className="mt-2 font-serif text-5xl font-light text-charcoal">
                {guest.name}
              </h1>
              <p className="mt-3 text-sm uppercase tracking-widest text-charcoal-soft">
                {guest.loyaltyTier}
                {guest.archetype && ` · ${guest.archetype}`}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ActionButton
                onClick={handleRegenerate}
                disabled={actionLoading}
                icon={<Sparkles className="h-3.5 w-3.5" />}
                label="Refresh intelligence"
              />
              <ActionButton
                onClick={handleFlightDelay}
                disabled={actionLoading || guest.flightStatus === "delayed"}
                icon={<Plane className="h-3.5 w-3.5" />}
                label="Simulate flight delay"
                variant="outline"
              />
            </div>
          </div>
          <GuestMetaRow guest={guest} />
        </header>

        <LiveScenarioBanner guestId={id} />

        <div className="mt-12 grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-10">
            <Section title="Narrative">
              <p className="font-display text-xl leading-relaxed text-charcoal">
                {guest.narrativeSummary}
              </p>
            </Section>

            <Section title="Emotional Memory">
              <div className="space-y-4">
                {guest.memories.map((m) => (
                  <div
                    key={m.id}
                    className="border-l-2 border-gold/40 pl-5 py-1"
                  >
                    <p className="text-xs uppercase tracking-widest text-gold">
                      {m.category}
                    </p>
                    <p className="mt-1 text-charcoal-soft">{m.content}</p>
                    {m.emotional && (
                      <p className="mt-1 text-xs italic text-charcoal-soft/70">
                        {m.emotional}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Recommended Actions">
              <div className="space-y-3">
                {guest.recommendations.map((r) => (
                  <div
                    key={r.id}
                    className={cn(
                      "flex gap-4 border p-5",
                      severityBoxClass(r.priority)
                    )}
                  >
                    <Badge variant={priorityBadgeVariant(r.priority)}>
                      {r.priority}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium capitalize">
                        {r.recommendationType.replace(/_/g, " ")}
                      </p>
                      <p className="mt-1 text-sm text-charcoal-soft">
                        {r.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Stay History">
              <div className="space-y-4">
                {guest.stays.map((s) => (
                  <div
                    key={s.id}
                    className="flex justify-between border-b border-divider pb-4 text-sm"
                  >
                    <div>
                      <p className="font-medium">{s.property}</p>
                      <p className="text-charcoal-soft">{s.roomType}</p>
                    </div>
                    <StayMeta s={s} />
                  </div>
                ))}
              </div>
            </Section>
          </div>

          <aside className="space-y-10">
            <Section title="Staff Affinity">
              <AffinitiesList affinities={guest.affinities} />
            </Section>

            <Section title="Service Recovery">
              <IncidentsList incidents={guest.incidents} />
            </Section>

            <Section title="Orchestration Timeline">
              <GuestTimeline events={guest.orchestrationEvents} />
            </Section>
          </aside>
        </div>
      </motion.div>
    </div>
  );
}

function GuestMetaRow({ guest }: { guest: GuestDetail }) {
  return (
    <div className="mt-8 flex flex-wrap gap-8 text-sm">
      <Meta label="Arrival" value={guest.arrivalEta || "—"} />
      <Meta label="Room" value={guest.roomType || "—"} />
      <Meta
        label="Sentiment"
        value={formatSentiment(guest.sentimentScore)}
        className={sentimentColor(guest.sentimentScore)}
      />
      <Meta label="Stays" value={String(guest.stayCount)} />
      {guest.riskLevel === "elevated" && (
        <Badge variant="risk">Requires attentive handling</Badge>
      )}
    </div>
  );
}

function StayMeta({
  s,
}: {
  s: GuestDetail["stays"][0];
}) {
  return (
    <div className="text-right text-charcoal-soft">
      <p>
        {new Date(s.checkIn).toLocaleDateString()} —{" "}
        {new Date(s.checkOut).toLocaleDateString()}
      </p>
      {s.satisfactionScore != null && (
        <p className="text-gold">
          Satisfaction {Math.round(s.satisfactionScore * 100)}%
        </p>
      )}
    </div>
  );
}

function AffinitiesList({
  affinities,
}: {
  affinities: GuestDetail["affinities"];
}) {
  return (
    <div className="space-y-4">
      {affinities.map((a) => (
        <AffinityCard key={a.id} a={a} />
      ))}
    </div>
  );
}

function AffinityCard({
  a,
}: {
  a: GuestDetail["affinities"][0];
}) {
  return (
    <div className="border border-divider p-4">
      <p className="font-serif text-lg">{a.staff.name}</p>
      <p className="text-xs text-charcoal-soft">{a.staff.role}</p>
      <p className="mt-2 text-sm text-charcoal-soft">{a.notes}</p>
      <p className="mt-2 text-xs text-gold">
        Affinity {Math.round(a.affinityScore * 100)}%
      </p>
    </div>
  );
}

function IncidentsList({
  incidents,
}: {
  incidents: GuestDetail["incidents"];
}) {
  if (incidents.length === 0) {
    return <p className="text-sm text-charcoal-soft">No open incidents.</p>;
  }
  return (
    <>
      {incidents.map((inc) => (
        <div
          key={inc.id}
          className={cn("mb-4 border p-4 text-sm", severityBoxClass(inc.severity))}
        >
          <p className="font-medium capitalize">
            {inc.category.replace(/_/g, " ")}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant={severityBadgeVariant(inc.severity)}>
              {inc.severity}
            </Badge>
            <Badge variant={resolutionBadgeVariant(inc.resolutionStatus)}>
              {inc.resolutionStatus}
            </Badge>
          </div>
          <p className="mt-3 text-charcoal-soft">{inc.recoveryNotes}</p>
        </div>
      ))}
    </>
  );
}

function GuestTimeline({
  events,
}: {
  events: GuestDetail["orchestrationEvents"];
}) {
  return (
    <div className="relative border-l border-gold/30 pl-6 space-y-6">
      {events.map((e) => (
        <div key={e.id} className="relative">
          <span className="absolute -left-[29px] top-1 h-2 w-2 rounded-full bg-gold" />
          <p className="text-[10px] uppercase tracking-widest text-gold">
            {e.timelineOffset}
          </p>
          <p className="font-medium">{e.title}</p>
          {e.description && (
            <p className="mt-1 text-sm text-charcoal-soft">{e.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function LoadingShell() {
  return (
    <div className="px-12 py-14">
      <div className="skeleton h-8 w-32" />
      <div className="skeleton mt-8 h-16 w-96" />
      <div className="skeleton mt-12 h-48 w-full" />
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-5 font-display text-xs uppercase tracking-[0.25em] text-gold">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Meta({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-charcoal-soft">
        {label}
      </p>
      <p className={cn("mt-0.5 font-medium", className)}>{value}</p>
    </div>
  );
}

function ActionButton({
  onClick,
  disabled,
  icon,
  label,
  variant = "solid",
}: {
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  variant?: "solid" | "outline";
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-widest transition-all duration-300 disabled:opacity-50",
        variant === "solid"
          ? "bg-charcoal text-ivory hover:bg-gold"
          : "border border-divider hover:border-gold/50"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
