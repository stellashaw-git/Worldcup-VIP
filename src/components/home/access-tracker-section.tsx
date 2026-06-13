"use client";

import { useMemo } from "react";
import { useHome } from "@/components/home/home-provider";
import { buildTrackerMetrics } from "@/lib/opportunities/tracker-metrics";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
    </div>
  );
}

export function AccessTrackerSection() {
  const { insights, records } = useHome();

  const tracker = useMemo(() => {
    if (records.length > 0) {
      return buildTrackerMetrics(records);
    }
    return insights.tracker;
  }, [records, insights.tracker]);

  const hasData =
    records.length > 0 || tracker.opportunitiesTracked > 0;

  return (
    <section className="border-b border-border/60 bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-6 flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
            Market Tracker
          </p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            2026 World Cup Access Tracker
          </h2>
          <p className="max-w-3xl text-muted-foreground">
            Real-time updates across hospitality programs, suites, lounges,
            private events, and premium experiences.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Opportunities Tracked"
            value={hasData ? String(tracker.opportunitiesTracked) : "—"}
          />
          <StatCard
            label="New Updates This Week"
            value={hasData ? String(tracker.newUpdatesThisWeek) : "—"}
          />
          <StatCard
            label="Host Cities Covered"
            value={hasData ? String(tracker.hostCitiesCovered) : "—"}
          />
          <StatCard
            label="Premium Experiences Listed"
            value={hasData ? String(tracker.premiumExperiencesListed) : "—"}
          />
        </div>
        {!hasData && (
          <p className="mt-4 text-sm text-muted-foreground">
            Loading access index… or refresh live data below for scrape updates.
          </p>
        )}
      </div>
    </section>
  );
}
