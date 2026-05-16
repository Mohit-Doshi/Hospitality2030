import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
