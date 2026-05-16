"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { api, StaffMember } from "@/lib/api";
import { PageHeader } from "@/components/guest/PageHeader";

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getStaff()
      .then(setStaff)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <StaffPageContent staff={staff} loading={loading} />
  );
}

function StaffPageContent({
  staff,
  loading,
}: {
  staff: StaffMember[];
  loading: boolean;
}) {
  return (
    <div className="fade-in px-12 py-14">
      <PageHeader
        title="Staff Intelligence"
        subtitle="Affinity matches and guest assignments — continuity that feels intentional."
      />

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {staff.map((member, i) => (
            <StaffCard key={member.id} member={member} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return <div className="skeleton h-48 border border-divider" />;
}

function StaffCard({ member, index }: { member: StaffMember; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.5 }}
      className="border border-divider bg-surface p-8"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 bg-ivory-deep font-serif text-lg text-gold">
          {member.avatarInitials}
        </div>
        <div>
          <h3 className="font-serif text-2xl font-light">{member.name}</h3>
          <p className="text-sm text-charcoal-soft">{member.role}</p>
        </div>
      </div>

      {member.affinities.length > 0 ? (
        <div className="mt-8 space-y-4 border-t border-divider pt-6">
          <p className="text-xs uppercase tracking-widest text-gold">
            Guest affinities
          </p>
          {member.affinities.map((a) => (
            <Link
              key={a.guest.id}
              href={`/guests/${a.guest.id}`}
              className="block border-l-2 border-gold/20 pl-4 transition-colors hover:border-gold"
            >
              <p className="font-medium">{a.guest.name}</p>
              <p className="text-xs text-charcoal-soft">
                {a.guest.loyaltyTier}
                {a.guest.arrivalEta && ` · ETA ${a.guest.arrivalEta}`}
              </p>
              <p className="mt-1 text-sm text-charcoal-soft">{a.notes}</p>
              <p className="mt-1 text-xs text-gold">
                Affinity {Math.round(a.affinityScore * 100)}%
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-charcoal-soft">
          No active guest affinities today.
        </p>
      )}
    </motion.div>
  );
}
