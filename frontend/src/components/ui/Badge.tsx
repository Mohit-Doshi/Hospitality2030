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
  "severity-low": "bg-emerald-900/8 text-emerald-900/75",
  "severity-medium": "bg-amber-900/10 text-amber-900/80",
  "severity-high": "bg-[#8b5a4a]/12 text-[#7a4a3c]",
  "status-open": "bg-amber-900/10 text-amber-900/85",
  "status-monitoring": "bg-slate-700/10 text-slate-700/85",
  "status-resolved": "bg-emerald-900/8 text-emerald-900/70",
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
