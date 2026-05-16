"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { api, ServiceIncident } from "@/lib/api";
import { PageHeader } from "@/components/guest/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { cn, resolutionBadgeVariant, severityBadgeVariant } from "@/lib/utils";

export default function RecoveryPage() {
  const [incidents, setIncidents] = useState<ServiceIncident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getRecovery()
      .then(setIncidents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const open = incidents.filter((i) => i.resolutionStatus !== "resolved");

  return (
    <div className="fade-in px-12 py-14">
      <PageHeader
        title="Service Recovery"
        subtitle="Operational clarity with empathy — track friction and guide future stays."
      />

      {loading ? (
        <div className="skeleton h-64 border border-divider" />
      ) : (
        <div className="space-y-6">
          {open.length > 0 && (
            <p className="text-sm text-charcoal-soft">
              {open.length} incident{open.length !== 1 ? "s" : ""} requiring
              attention
            </p>
          )}
          {incidents.map((inc, i) => (
            <motion.article
              key={inc.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className={cn(
                "border bg-surface p-8",
                inc.severity === "high"
                  ? "border-[#8b5a4a]/25"
                  : inc.severity === "medium"
                    ? "border-amber-900/15"
                    : "border-divider"
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <Link
                    href={`/guests/${inc.guest.id}`}
                    className="font-serif text-2xl text-charcoal hover:text-gold transition-colors"
                  >
                    {inc.guest.name}
                  </Link>
                  <p className="mt-1 text-xs uppercase tracking-widest text-charcoal-soft">
                    {inc.guest.loyaltyTier}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={severityBadgeVariant(inc.severity)}>
                    {inc.severity}
                  </Badge>
                  <Badge variant={resolutionBadgeVariant(inc.resolutionStatus)}>
                    {inc.resolutionStatus}
                  </Badge>
                </div>
              </div>
              <h3 className="mt-6 font-display text-lg capitalize text-charcoal">
                {inc.category.replace(/_/g, " ")}
              </h3>
              {inc.recoveryNotes && (
                <p className="mt-3 max-w-2xl font-display text-lg leading-relaxed text-charcoal-soft">
                  {inc.recoveryNotes}
                </p>
              )}
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
