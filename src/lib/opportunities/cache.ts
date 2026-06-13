import type {
  AccessRecord,
  DirectoryMetrics,
  GroupedEvent,
} from "@/lib/opportunities/types";

type DirectoryCache = {
  records: AccessRecord[];
  groupedEvents: GroupedEvent[];
  metrics: DirectoryMetrics;
};

let directoryCache: DirectoryCache = {
  records: [],
  groupedEvents: [],
  metrics: {
    totalOpportunities: 0,
    citiesCovered: 0,
    matchesCovered: 0,
    latestUpdate: null,
    averagePriceMin: null,
    averagePriceMax: null,
    currency: "USD",
  },
};

export function setDirectoryCache(data: DirectoryCache) {
  directoryCache = data;
}

export function getDirectoryCache(): DirectoryCache {
  return directoryCache;
}

export function getRecordBySlug(slug: string): AccessRecord | undefined {
  return directoryCache.records.find(
    (record) => record.slug === slug || record.id === slug
  );
}

export function getGroupedEventByKey(groupKey: string): GroupedEvent | undefined {
  return directoryCache.groupedEvents.find(
    (event) => event.groupKey === groupKey
  );
}
