"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Arrivals" },
  { href: "/recovery", label: "Service Recovery" },
  { href: "/staff", label: "Staff Intelligence" },
  { href: "/orchestration", label: "Orchestration" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-divider bg-surface/80 backdrop-blur-sm">
      <BrandMark />
      <nav className="mt-12 flex flex-1 flex-col gap-1 px-6">
        {nav.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-2.5 text-sm tracking-wide transition-all duration-300",
                active
                  ? "border-l-2 border-gold pl-[10px] text-charcoal"
                  : "border-l-2 border-transparent text-charcoal-soft hover:text-charcoal"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-divider px-6 py-8">
        <p className="font-display text-xs uppercase tracking-[0.2em] text-gold">
          Rosewood Sand Hill
        </p>
        <p className="mt-1 text-xs text-charcoal-soft">
          Hospitality Intelligence
        </p>
      </div>
    </aside>
  );
}

function BrandMark() {
  return (
    <div className="px-6 pt-10">
      <p className="font-serif text-2xl font-light tracking-tight text-charcoal">
        Rosewood
      </p>
      <p className="mt-0.5 font-display text-sm italic text-gold">
        Intelligence
      </p>
    </div>
  );
}
