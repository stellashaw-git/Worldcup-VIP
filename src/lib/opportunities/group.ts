import { computeMetricsAveragePrice } from "@/lib/opportunities/format";
import type {
  AccessRecord,
  DirectoryMetrics,
  GroupedEvent,
  SourceOffering,
} from "@/lib/opportunities/types";

export function groupRecords(records: AccessRecord[]): GroupedEvent[] {
  const groups = new Map<string, AccessRecord[]>();

  for (const record of records) {
    if (!record.groupKey.startsWith("record-")) {
      const existing = groups.get(record.groupKey) ?? [];
      existing.push(record);
      groups.set(record.groupKey, existing);
    }
  }

  return Array.from(groups.entries()).map(([groupKey, groupRecords]) => {
    const primary = groupRecords[0];

    const offerings: SourceOffering[] = groupRecords
      .map((record) => ({
        recordId: record.id,
        slug: record.slug,
        sourceName: record.sourceName,
        sourceUrl: record.sourceUrl,
        accessType: record.accessType,
        hospitalityCategory: record.hospitalityCategory,
        priceMin: record.priceMin,
        priceMax: record.priceMax,
        currency: record.currency,
        availability: record.availability,
        capacity: record.capacity,
      }))
      .sort((a, b) => {
        const aPrice = a.priceMin ?? a.priceMax ?? Infinity;
        const bPrice = b.priceMin ?? b.priceMax ?? Infinity;
        return aPrice - bPrice;
      });

    return {
      groupKey,
      matchName: primary.matchName,
      matchStage: primary.matchStage,
      city: primary.city,
      venue: primary.venue,
      eventDate: primary.eventDate,
      offerings,
    };
  });
}

export function computeDirectoryMetrics(records: AccessRecord[]): DirectoryMetrics {
  const cities = new Set(
    records.map((r) => r.city).filter((c) => c !== "Unknown")
  );
  const matches = new Set(
    records.map((r) => r.matchName).filter((m) => m !== "Unknown")
  );
  const latestUpdate = records.length
    ? records.reduce((latest, r) =>
        r.lastUpdated > latest ? r.lastUpdated : latest
      , records[0].lastUpdated)
    : null;

  const { averagePriceMin, averagePriceMax, currency } =
    computeMetricsAveragePrice(records);

  return {
    totalOpportunities: records.length,
    citiesCovered: cities.size,
    matchesCovered: matches.size,
    latestUpdate,
    averagePriceMin,
    averagePriceMax,
    currency,
  };
}

export function findGroupedEvent(
  groupedEvents: GroupedEvent[],
  groupKey: string
): GroupedEvent | undefined {
  return groupedEvents.find((event) => event.groupKey === groupKey);
}
