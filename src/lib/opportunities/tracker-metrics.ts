import type { AccessRecord } from "@/lib/opportunities/types";
import type { TrackerMetrics } from "@/lib/engagement/types";

const PREMIUM_ACCESS = new Set([
  "Suite",
  "Shared Suite",
  "Lounge",
  "Hospitality Package",
  "VIP Experience",
  "Private Event",
]);

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function isWithinWeek(isoDate: string): boolean {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return false;
  return Date.now() - date.getTime() <= ONE_WEEK_MS;
}

export function buildTrackerMetrics(records: AccessRecord[]): TrackerMetrics {
  const cities = new Set(
    records.map((r) => r.city).filter((c) => c !== "Unknown")
  );

  return {
    opportunitiesTracked: records.length,
    newUpdatesThisWeek: records.filter((r) => isWithinWeek(r.lastUpdated)).length,
    hostCitiesCovered: cities.size,
    premiumExperiencesListed: records.filter((r) =>
      PREMIUM_ACCESS.has(r.accessType)
    ).length,
  };
}
