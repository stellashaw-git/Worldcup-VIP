import type { EngagementAction, RecordEngagement } from "@/lib/engagement/types";

type EngagementStore = {
  records: Record<string, RecordEngagement>;
  teams: Record<string, number>;
  cities: Record<string, number>;
  categories: Record<string, number>;
  matchStages: Record<string, number>;
};

const store: EngagementStore = {
  records: {},
  teams: {},
  cities: {},
  categories: {},
  matchStages: {},
};

function emptyRecordEngagement(): RecordEngagement {
  return { views: 0, follows: 0, updateRequests: 0, waitlistJoins: 0 };
}

function getRecord(recordId: string): RecordEngagement {
  if (!store.records[recordId]) {
    store.records[recordId] = emptyRecordEngagement();
  }
  return store.records[recordId];
}

export function trackEngagement(
  action: EngagementAction,
  recordId: string,
  meta?: {
    team?: string;
    city?: string;
    category?: string;
    matchStage?: string;
  }
) {
  const record = getRecord(recordId);

  switch (action) {
    case "view":
      record.views += 1;
      break;
    case "follow":
      record.follows += 1;
      break;
    case "request-update":
      record.updateRequests += 1;
      break;
    case "waitlist":
      record.waitlistJoins += 1;
      break;
  }

  if (meta?.team) {
    store.teams[meta.team] = (store.teams[meta.team] ?? 0) + 1;
  }
  if (meta?.city && meta.city !== "Unknown") {
    store.cities[meta.city] = (store.cities[meta.city] ?? 0) + 1;
  }
  if (meta?.category && meta.category !== "Unknown") {
    store.categories[meta.category] =
      (store.categories[meta.category] ?? 0) + 1;
  }
  if (meta?.matchStage && meta.matchStage !== "Unknown") {
    store.matchStages[meta.matchStage] =
      (store.matchStages[meta.matchStage] ?? 0) + 1;
  }
}

export function getEngagementStore(): EngagementStore {
  return store;
}

export function getRecordEngagementMap(): Record<string, RecordEngagement> {
  return { ...store.records };
}
