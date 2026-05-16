"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/guest/PageHeader";

type OrchestrationEvent = {
  id: string;
  timelineOffset: string;
  title: string;
  description: string | null;
  eventType: string;
  guest: { id: string; name: string };
};

export default function OrchestrationPage() {
  const [events, setEvents] = useState<OrchestrationEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getOrchestration()
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fade-in px-12 py-14">
      <PageHeader
        title="AI Orchestration"
        subtitle="Invisible concierge intelligence — event-driven preparation across the guest journey."
      />

      {loading ? (
        <div className="skeleton h-96 max-w-2xl border border-divider" />
      ) : (
        <div className="max-w-3xl">
          <OrchestrationTimeline events={events} />
        </div>
      )}
    </div>
  );
}

function OrchestrationTimeline({ events }: { events: OrchestrationEvent[] }) {
  return (
    <div className="relative border-l border-gold/30 pl-10 space-y-10">
      {events.map((e, i) => (
        <motion.div
          key={e.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05, duration: 0.5 }}
          className="relative"
        >
          <span className="absolute -left-[45px] top-1.5 h-3 w-3 rounded-full border-2 border-gold bg-ivory" />
          <p className="text-[10px] uppercase tracking-[0.2em] text-gold">
            {e.timelineOffset}
          </p>
          <p className="mt-1 font-serif text-xl text-charcoal">{e.title}</p>
          <Link
            href={`/guests/${e.guest.id}`}
            className="text-sm text-gold hover:underline"
          >
            {e.guest.name}
          </Link>
          {e.description && (
            <p className="mt-2 text-sm leading-relaxed text-charcoal-soft">
              {e.description}
            </p>
          )}
          <span className="mt-2 inline-block text-[10px] uppercase tracking-widest text-charcoal-soft/60">
            {e.eventType}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
