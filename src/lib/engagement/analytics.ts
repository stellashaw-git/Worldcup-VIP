import type { AccessRecord } from "@/lib/opportunities/types";
import { buildTrackerMetrics } from "@/lib/opportunities/tracker-metrics";
import { getEngagementStore } from "@/lib/engagement/store";
import type {
  FollowedItem,
  MarketInsights,
  PulseItem,
  RecordEngagement,
  TrendingItem,
} from "@/lib/engagement/types";

const TEAM_KEYWORDS = [
  "Argentina",
  "France",
  "Brazil",
  "England",
  "USA",
  "Mexico",
  "Germany",
  "Spain",
];

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function isWithinWeek(isoDate: string): boolean {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return false;
  return Date.now() - date.getTime() <= ONE_WEEK_MS;
}

function countTeamMentions(text: string): Record<string, number> {
  const counts: Record<string, number> = {};
  const lower = text.toLowerCase();
  for (const team of TEAM_KEYWORDS) {
    if (lower.includes(team.toLowerCase())) {
      counts[team] = (counts[team] ?? 0) + 1;
    }
  }
  return counts;
}

function topPulseItems(
  counts: Record<string, number>,
  limit = 4
): PulseItem[] {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, score]) => ({ label, score }));
}

function buildTrending(
  records: AccessRecord[],
  engagement: Record<string, RecordEngagement>
): TrendingItem[] {
  const items: TrendingItem[] = [];
  const recent = records.filter((r) => isWithinWeek(r.lastUpdated));

  const finalSuites = recent.find(
    (r) =>
      r.matchStage === "Final" &&
      (r.accessType === "Suite" || r.accessType === "Shared Suite")
  );
  if (finalSuites) {
    items.push({
      id: "final-suites",
      label: "Final Suites Updated",
      description: `${finalSuites.venue} · ${finalSuites.city}`,
      recordId: finalSuites.id,
      slug: finalSuites.slug,
    });
  }

  const hospitality = recent.find(
    (r) =>
      r.accessType === "Hospitality Package" ||
      r.hospitalityCategory === "FIFA Hospitality"
  );
  if (hospitality) {
    items.push({
      id: "hospitality",
      label: "New Hospitality Inventory Released",
      description: hospitality.matchName,
      recordId: hospitality.id,
      slug: hospitality.slug,
    });
  }

  const vip = recent.find(
    (r) =>
      r.accessType === "VIP Experience" || r.accessType === "Private Event"
  );
  if (vip) {
    items.push({
      id: "vip",
      label: "VIP Events Added",
      description: vip.matchName,
      recordId: vip.id,
      slug: vip.slug,
    });
  }

  const semi = recent.find((r) => r.matchStage === "Semi Final");
  if (semi) {
    items.push({
      id: "semi",
      label: "Semi Final Opportunities Added",
      description: `${semi.venue} · ${semi.city}`,
      recordId: semi.id,
      slug: semi.slug,
    });
  }

  const mostViewed = [...records]
    .sort(
      (a, b) =>
        (engagement[b.id]?.views ?? 0) - (engagement[a.id]?.views ?? 0)
    )
    .find((r) => (engagement[r.id]?.views ?? 0) > 0);

  if (mostViewed) {
    items.push({
      id: "most-viewed",
      label: "Most Viewed Opportunity",
      description: mostViewed.matchName,
      recordId: mostViewed.id,
      slug: mostViewed.slug,
    });
  } else if (records[0]) {
    items.push({
      id: "most-viewed-fallback",
      label: "Most Viewed Opportunity",
      description: records[0].matchName,
      recordId: records[0].id,
      slug: records[0].slug,
    });
  }

  const mostRequested = [...records]
    .sort(
      (a, b) =>
        (engagement[b.id]?.updateRequests ?? 0) -
        (engagement[a.id]?.updateRequests ?? 0)
    )
    .find((r) => (engagement[r.id]?.updateRequests ?? 0) > 0);

  if (mostRequested) {
    items.push({
      id: "most-requested",
      label: "Most Requested Opportunity",
      description: mostRequested.matchName,
      recordId: mostRequested.id,
      slug: mostRequested.slug,
    });
  } else if (records.length > 1) {
    items.push({
      id: "most-requested-fallback",
      label: "Most Requested Opportunity",
      description: records[1].matchName,
      recordId: records[1].id,
      slug: records[1].slug,
    });
  }

  return items.slice(0, 6);
}

function buildMostFollowed(
  records: AccessRecord[],
  engagement: Record<string, RecordEngagement>
): FollowedItem[] {
  const ranked = [...records]
    .map((record) => {
      const stats = engagement[record.id];
      const followers = stats?.follows ?? 0;
      const updateRequests = stats?.updateRequests ?? 0;
      const score = followers * 3 + updateRequests * 2 + (stats?.views ?? 0);
      return { record, followers, updateRequests, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  if (ranked.every((r) => r.score === 0)) {
    return records.slice(0, 5).map((record) => ({
      recordId: record.id,
      slug: record.slug,
      label:
        record.matchName !== "Unknown"
          ? record.matchName
          : record.accessType,
      sublabel:
        record.venue !== "Unknown"
          ? `${record.venue} · ${record.city}`
          : record.city,
      followers: 0,
      updateRequests: 0,
      lastUpdated: record.lastUpdated,
    }));
  }

  return ranked.map(({ record, followers, updateRequests }) => ({
    recordId: record.id,
    slug: record.slug,
    label:
      record.matchName !== "Unknown" ? record.matchName : record.accessType,
    sublabel:
      record.venue !== "Unknown"
        ? `${record.venue} · ${record.city}`
        : record.city,
    followers,
    updateRequests,
    lastUpdated: record.lastUpdated,
  }));
}

function buildPulse(
  records: AccessRecord[],
  store: ReturnType<typeof getEngagementStore>
): MarketInsights["pulse"] {
  const teamCounts = { ...store.teams };
  const cityCounts = { ...store.cities };
  const categoryCounts = { ...store.categories };
  const matchCounts = { ...store.matchStages };

  for (const record of records) {
    const text = `${record.matchName} ${record.summary}`;
    const teams = countTeamMentions(text);
    for (const [team, count] of Object.entries(teams)) {
      teamCounts[team] = (teamCounts[team] ?? 0) + count;
    }
    if (record.city !== "Unknown") {
      cityCounts[record.city] = (cityCounts[record.city] ?? 0) + 1;
    }
    const category =
      record.accessType !== "Unknown" ? record.accessType : record.hospitalityCategory;
    if (category !== "Unknown") {
      categoryCounts[category] = (categoryCounts[category] ?? 0) + 1;
    }
    if (record.matchStage !== "Unknown") {
      matchCounts[record.matchStage] = (matchCounts[record.matchStage] ?? 0) + 1;
    }
  }

  const defaultTeams = ["Argentina", "France", "Brazil", "England"];
  const defaultCities = ["New York", "Miami", "Dallas", "Los Angeles"];
  const defaultCategories = [
    "Hospitality Package",
    "Suite",
    "VIP Experience",
  ];

  const teams = topPulseItems(teamCounts, 4);
  const cities = topPulseItems(cityCounts, 4);
  const categories = topPulseItems(categoryCounts, 4);
  const matches = topPulseItems(matchCounts, 4);

  if (!teams.length) {
    return {
      teams: defaultTeams.map((label) => ({ label, score: 0 })),
      matches: matches.length
        ? matches
        : [{ label: "World Cup Final", score: 0 }],
      cities: defaultCities.map((label) => ({ label, score: 0 })),
      categories: defaultCategories.map((label) => ({ label, score: 0 })),
    };
  }

  return {
    teams,
    matches,
    cities: cities.length
      ? cities
      : defaultCities.map((label) => ({ label, score: 0 })),
    categories: categories.length
      ? categories
      : defaultCategories.map((label) => ({ label, score: 0 })),
  };
}

export function computeMarketInsights(
  records: AccessRecord[],
  store: ReturnType<typeof getEngagementStore>,
  engagement: Record<string, RecordEngagement>
): MarketInsights {
  return {
    tracker: buildTrackerMetrics(records),
    trending: buildTrending(records, engagement),
    mostFollowed: buildMostFollowed(records, engagement),
    pulse: buildPulse(records, store),
    recordEngagement: engagement,
  };
}
