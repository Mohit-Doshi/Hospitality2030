"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GuestSummary } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { cn, formatSentiment, sentimentColor } from "@/lib/utils";

export function GuestCard({
  guest,
  index = 0,
}: {
  guest: GuestSummary;
  index?: number;
}) {
  const hasRisk = guest.riskLevel === "elevated";
  const topRec = guest.recommendations?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/guests/${guest.id}`}
        className="group block border border-divider bg-surface p-8 transition-all duration-500 hover:border-gold/30 hover:shadow-[0_8px_30px_rgba(44,42,38,0.06)]"
      >
        <GuestCardHeader guest={guest} hasRisk={hasRisk} />
        <p className="mt-4 line-clamp-2 font-display text-lg leading-relaxed text-charcoal-soft">
          {guest.narrativeSummary ||
            "Narrative will be generated from guest memory."}
        </p>
        <div className="mt-6 flex flex-wrap gap-6 border-t border-divider pt-6 text-sm">
          <Stat label="ETA" value={guest.arrivalEta || "—"} />
          <Stat label="Stays" value={String(guest.stayCount)} />
          <Stat
            label="Sentiment"
            value={formatSentiment(guest.sentimentScore)}
            className={sentimentColor(guest.sentimentScore)}
          />
          {guest.archetype && (
            <Stat label="Archetype" value={guest.archetype} small />
          )}
        </div>
        {guest.delightOpportunity && (
          <p className="mt-4 text-xs text-gold">
            <span className="uppercase tracking-widest">Opportunity · </span>
            {guest.delightOpportunity}
          </p>
        )}
        {topRec && (
          <p className="mt-3 text-xs text-charcoal-soft">
            <span className="uppercase tracking-widest text-charcoal/60">
              Suggested ·{" "}
            </span>
            {topRec.reason}
          </p>
        )}
      </Link>
    </motion.div>
  );
}

function GuestCardHeader({
  guest,
  hasRisk,
}: {
  guest: GuestSummary;
  hasRisk: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="font-serif text-2xl font-light tracking-tight text-charcoal group-hover:text-gold transition-colors duration-300">
          {guest.name}
        </h3>
        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-charcoal-soft">
          {guest.loyaltyTier}
          {guest.roomType && ` · ${guest.roomType}`}
        </p>
      </div>
      <div className="flex flex-col items-end gap-2">
        {hasRisk && <Badge variant="risk">Attentive</Badge>}
        {guest.flightStatus === "delayed" && (
          <Badge variant="muted">Flight delayed</Badge>
        )}
        {!hasRisk && guest.flightStatus !== "delayed" && (
          <Badge variant="gold">{guest.loyaltyTier}</Badge>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  className,
  small,
}: {
  label: string;
  value: string;
  className?: string;
  small?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal-soft">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5",
          small ? "text-xs max-w-[140px]" : "font-medium",
          className
        )}
      >
        {value}
      </p>
    </div>
  );
}
