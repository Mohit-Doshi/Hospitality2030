"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Scenario } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { priorityBadgeVariant, severityBadgeVariant } from "@/lib/utils";

export function ScenarioCard({
  scenario,
  index = 0,
  onAcknowledge,
  compact = false,
}: {
  scenario: Scenario;
  index?: number;
  onAcknowledge?: (id: string) => void;
  compact?: boolean;
}) {
  const eventVariant =
    scenario.eventType === "complaint"
      ? "risk"
      : scenario.eventType === "compliment"
        ? "gold"
        : "muted";

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.45 }}
      className={
        scenario.eventType === "complaint"
          ? "border border-[#8b5a4a]/30 bg-surface"
          : "border border-divider bg-surface"
      }
    >
      <ScenarioCardHeader scenario={scenario} eventVariant={eventVariant} />

      <div className="px-6 pb-6 pt-2">
        <p className="font-display text-lg italic text-charcoal-soft">
          &ldquo;{scenario.scenarioText}&rdquo;
        </p>

        {scenario.analysis && (
          <div className="mt-5">
            <p className="text-[10px] uppercase tracking-widest text-gold">
              Intelligence analysis
            </p>
            <p className="mt-1 text-sm leading-relaxed text-charcoal">
              {scenario.analysis}
            </p>
          </div>
        )}

        {scenario.diagnosis && !compact && (
          <div className="mt-5 border-l-2 border-gold/50 pl-4">
            <p className="text-[10px] uppercase tracking-widest text-gold">
              Staff diagnosis
            </p>
            <p className="mt-1 text-sm leading-relaxed text-charcoal">
              {scenario.diagnosis}
            </p>
            {scenario.suggestedStaff && (
              <p className="mt-2 text-xs text-charcoal-soft">
                Suggested lead:{" "}
                <span className="text-gold">{scenario.suggestedStaff}</span>
              </p>
            )}
          </div>
        )}

        {scenario.remedies?.length > 0 && (
          <div className="mt-5 space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-charcoal-soft">
              Recommended actions
            </p>
            {scenario.remedies.map((r, i) => (
              <div
                key={i}
                className="flex gap-3 border border-divider bg-ivory/50 p-3 text-sm"
              >
                <Badge variant={priorityBadgeVariant(r.priority)}>
                  {r.priority}
                </Badge>
                <RemedyItem r={r} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-divider pt-4">
          <p className="text-xs text-charcoal-soft">
            {new Date(scenario.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          {scenario.status === "active" && onAcknowledge && (
            <button
              onClick={() => onAcknowledge(scenario.id)}
              className="text-xs uppercase tracking-widest text-gold hover:text-charcoal transition-colors"
            >
              Acknowledge
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function ScenarioCardHeader({
  scenario,
  eventVariant,
}: {
  scenario: Scenario;
  eventVariant: "risk" | "gold" | "muted";
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 px-6 pt-6 pb-2">
      <div>
        <Link
          href={`/guests/${scenario.guest.id}`}
          className="font-serif text-xl text-charcoal hover:text-gold transition-colors"
        >
          {scenario.guest.name}
        </Link>
        <p className="text-xs uppercase tracking-widest text-charcoal-soft">
          {scenario.guest.loyaltyTier}
          {scenario.guest.roomType && ` · ${scenario.guest.roomType}`}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={eventVariant}>{scenario.eventType}</Badge>
        <Badge variant={severityBadgeVariant(scenario.urgency)}>
          {scenario.urgency}
        </Badge>
        {scenario.status === "active" && (
          <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
        )}
      </div>
    </div>
  );
}

function RemedyItem({
  r,
}: {
  r: { action: string; reason: string; assignTo?: string };
}) {
  return (
    <div>
      <p className="font-medium capitalize">{r.action.replace(/_/g, " ")}</p>
      <p className="text-charcoal-soft">{r.reason}</p>
      {r.assignTo && (
        <p className="mt-1 text-xs text-gold">Assign: {r.assignTo}</p>
      )}
    </div>
  );
}
