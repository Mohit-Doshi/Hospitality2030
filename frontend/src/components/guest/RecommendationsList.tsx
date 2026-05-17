"use client";

import { Check, RotateCcw } from "lucide-react";
import { Recommendation } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import {
  cn,
  priorityBadgeVariant,
  recommendationBoxClass,
  resolutionBadgeVariant,
} from "@/lib/utils";

export function RecommendationsList({
  recommendations,
  resolvingId,
  onResolve,
  onReopen,
}: {
  recommendations: Recommendation[];
  resolvingId: string | null;
  onResolve: (id: string) => void;
  onReopen: (id: string) => void;
}) {
  if (recommendations.length === 0) {
    return (
      <p className="text-sm text-charcoal-soft">No recommendations at this time.</p>
    );
  }

  const pending = recommendations.filter((r) => r.status !== "resolved");
  const resolved = recommendations.filter((r) => r.status === "resolved");

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <div className="space-y-3">
          {pending.map((r) => (
            <RecommendationRow
              key={r.id}
              recommendation={r}
              resolving={resolvingId === r.id}
              onResolve={() => onResolve(r.id)}
            />
          ))}
        </div>
      )}
      {resolved.length > 0 && (
        <div>
          <p className="mb-3 text-[10px] uppercase tracking-widest text-charcoal-soft">
            Resolved
          </p>
          <div className="space-y-3">
            {resolved.map((r) => (
              <RecommendationRow
                key={r.id}
                recommendation={r}
                resolving={resolvingId === r.id}
                onReopen={() => onReopen(r.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RecommendationRow({
  recommendation: r,
  resolving,
  onResolve,
  onReopen,
}: {
  recommendation: Recommendation;
  resolving: boolean;
  onResolve?: () => void;
  onReopen?: () => void;
}) {
  const isResolved = r.status === "resolved";

  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-4 border p-5 transition-opacity",
        recommendationBoxClass(r.priority, r.status)
      )}
    >
      <div className="flex min-w-0 flex-1 gap-4">
        <div className="flex flex-col gap-2">
          <Badge variant={priorityBadgeVariant(r.priority)}>{r.priority}</Badge>
          {isResolved && (
            <Badge variant={resolutionBadgeVariant("resolved")}>Resolved</Badge>
          )}
        </div>
        <div className="min-w-0">
          <p
            className={cn(
              "text-sm font-medium capitalize",
              isResolved && "text-charcoal-soft line-through decoration-charcoal-soft/40"
            )}
          >
            {r.recommendationType.replace(/_/g, " ")}
          </p>
          <p
            className={cn(
              "mt-1 text-sm text-charcoal-soft",
              isResolved && "opacity-70"
            )}
          >
            {r.reason}
          </p>
        </div>
      </div>

      <div className="shrink-0">
        {!isResolved && onResolve && (
          <button
            type="button"
            onClick={onResolve}
            disabled={resolving}
            className="inline-flex items-center gap-1.5 border border-charcoal/20 px-3 py-1.5 text-[10px] uppercase tracking-widest text-charcoal transition-colors hover:border-gold hover:text-gold disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" />
            {resolving ? "Saving…" : "Resolve"}
          </button>
        )}
        {isResolved && onReopen && (
          <button
            type="button"
            onClick={onReopen}
            disabled={resolving}
            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-charcoal-soft transition-colors hover:text-gold disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reopen
          </button>
        )}
      </div>
    </div>
  );
}