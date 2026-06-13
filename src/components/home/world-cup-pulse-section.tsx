"use client";

import { useHome } from "@/components/home/home-provider";

function PulseGroup({
  title,
  items,
}: {
  title: string;
  items: { label: string; score: number }[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item.label}
            className="rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs font-medium"
          >
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function WorldCupPulseSection() {
  const { insights } = useHome();
  const pulse = insights.pulse;

  const hasPulse =
    pulse.teams.length > 0 ||
    pulse.cities.length > 0 ||
    pulse.categories.length > 0;

  if (!hasPulse) {
    return null;
  }

  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            World Cup Pulse
          </h2>
          <p className="text-sm text-muted-foreground">
            Market attention across teams, matches, host cities, and access
            categories — intelligence only, not predictions or betting.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <PulseGroup title="Teams in Focus" items={pulse.teams} />
          <PulseGroup title="Matches in Focus" items={pulse.matches} />
          <PulseGroup title="Most Viewed Host Cities" items={pulse.cities} />
          <PulseGroup
            title="Most Viewed Opportunity Categories"
            items={pulse.categories}
          />
        </div>
      </div>
    </section>
  );
}
