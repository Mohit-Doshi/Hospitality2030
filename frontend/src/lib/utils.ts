import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { BadgeVariant } from "@/components/ui/Badge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function severityBadgeVariant(severity: string): BadgeVariant {
  const key = severity.toLowerCase();
  if (key === "low") return "severity-low";
  if (key === "high") return "severity-high";
  return "severity-medium";
}

export function resolutionBadgeVariant(status: string): BadgeVariant {
  const key = status.toLowerCase();
  if (key === "resolved") return "status-resolved";
  if (key === "monitoring") return "status-monitoring";
  return "status-open";
}

export function priorityBadgeVariant(priority: string): BadgeVariant {
  return severityBadgeVariant(priority);
}

export function formatSentiment(score: number): string {
  if (score >= 0.85) return "Positive";
  if (score >= 0.7) return "Stable";
  return "Attentive";
}

export function sentimentColor(score: number): string {
  if (score >= 0.85) return "text-emerald-800/80";
  if (score >= 0.7) return "text-amber-900/70";
  return "text-rose-900/70";
}
