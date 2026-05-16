import { cn } from "@/lib/utils";

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "gold" | "risk" | "muted";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 text-[10px] uppercase tracking-[0.15em]",
        variant === "gold" && "bg-gold/10 text-gold",
        variant === "risk" && "bg-[#8b5a4a]/10 text-[#8b5a4a]",
        variant === "muted" && "bg-ivory-deep text-charcoal-soft",
        variant === "default" && "bg-ivory-deep text-charcoal-soft",
        className
      )}
    >
      {children}
    </span>
  );
}
