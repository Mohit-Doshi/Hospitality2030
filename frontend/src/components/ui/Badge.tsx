import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "default"
  | "gold"
  | "risk"
  | "muted"
  | "severity-low"
  | "severity-medium"
  | "severity-high"
  | "status-open"
  | "status-monitoring"
  | "status-resolved";

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-ivory-deep text-charcoal-soft",
  gold: "bg-gold/10 text-gold",
  risk: "bg-[#8b5a4a]/10 text-[#8b5a4a]",
  muted: "bg-ivory-deep text-charcoal-soft",
  "severity-low": "bg-emerald-200/90 text-charcoal",
  "severity-medium": "bg-amber-200/90 text-charcoal",
  "severity-high": "bg-[#e8cfc6] text-charcoal",
  "status-open": "bg-amber-200/90 text-charcoal",
  "status-monitoring": "bg-slate-200/90 text-charcoal",
  "status-resolved": "bg-emerald-200/90 text-charcoal",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 text-[10px] uppercase tracking-[0.15em]",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
