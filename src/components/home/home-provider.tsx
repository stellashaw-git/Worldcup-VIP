"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  AccessRecord,
  DirectoryMetrics,
  SearchOpportunitiesResponse,
} from "@/lib/opportunities/types";
import type { MarketInsights } from "@/lib/engagement/types";
import { isOfficialHighTrustSource, passesOfficialSourceCriteria } from "@/lib/opportunities/official-quality";
import { passesPublicRelaxedCriteria } from "@/lib/opportunities/quality";

export const DIRECTORY_SESSION_KEY = "blackbook-directory";
const FOLLOWED_LOCAL_KEY = "blackbook-followed";

type DirectoryState = {
  records: AccessRecord[];
  groupedEvents: SearchOpportunitiesResponse["groupedEvents"];
  metrics: DirectoryMetrics;
};

type HomeContextValue = {
  records: AccessRecord[];
  metrics: DirectoryMetrics | null;
  insights: MarketInsights;
  isLoading: boolean;
  error: string | null;
  emptyMessage: string | null;
  refreshPublicResults: () => Promise<void>;
  followedIds: Set<string>;
  isFollowed: (recordId: string) => boolean;
  followRecord: (record: AccessRecord) => Promise<void>;
  requestUpdates: (record: AccessRecord) => Promise<void>;
  trackView: (record: AccessRecord) => Promise<void>;
};

const defaultInsights: MarketInsights = {
  tracker: {
    opportunitiesTracked: 0,
    newUpdatesThisWeek: 0,
    hostCitiesCovered: 0,
    premiumExperiencesListed: 0,
  },
  trending: [],
  mostFollowed: [],
  pulse: {
    teams: [],
    matches: [],
    cities: [],
    categories: [],
  },
  recordEngagement: {},
};

const HomeContext = createContext<HomeContextValue | null>(null);

function isPublicRecord(record: AccessRecord): boolean {
  if (!record.sourceType || record.confidenceScore === undefined) {
    return false;
  }
  if (isOfficialHighTrustSource(record.sourceType)) {
    return passesOfficialSourceCriteria(record);
  }
  return passesPublicRelaxedCriteria(record);
}

function filterPublicRecords(records: AccessRecord[]): AccessRecord[] {
  return records.filter(isPublicRecord);
}

function saveDirectoryToSession(data: DirectoryState) {
  const curated = {
    ...data,
    records: filterPublicRecords(data.records),
  };
  try {
    sessionStorage.setItem(DIRECTORY_SESSION_KEY, JSON.stringify(curated));
  } catch {
    // Ignore.
  }
}

function loadFollowedFromLocal(): Set<string> {
  try {
    const raw = localStorage.getItem(FOLLOWED_LOCAL_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveFollowedToLocal(ids: Set<string>) {
  try {
    localStorage.setItem(FOLLOWED_LOCAL_KEY, JSON.stringify([...ids]));
  } catch {
    // Ignore.
  }
}

export function HomeProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<AccessRecord[]>([]);
  const [metrics, setMetrics] = useState<DirectoryMetrics | null>(null);
  const [insights, setInsights] = useState<MarketInsights | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emptyMessage, setEmptyMessage] = useState<string | null>(null);
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());

  const fetchInsights = useCallback(async () => {
    try {
      const response = await fetch("/api/engagement", { cache: "no-store" });
      if (response.ok) {
        const data = (await response.json()) as MarketInsights;
        setInsights(data);
      }
    } catch {
      // Keep existing insights.
    }
  }, []);

  const postEngagement = useCallback(
    async (
      action: "view" | "follow" | "request-update",
      record: AccessRecord
    ) => {
      try {
        const response = await fetch("/api/engagement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            recordId: record.id,
            meta: {
              city: record.city,
              category: record.accessType,
              matchStage: record.matchStage,
            },
          }),
        });
        if (response.ok) {
          const data = await response.json();
          if (data.insights) setInsights(data.insights as MarketInsights);
        }
      } catch {
        // Non-blocking.
      }
    },
    []
  );

  useEffect(() => {
    setFollowedIds(loadFollowedFromLocal());

    async function loadStarterDirectory() {
      try {
        const response = await fetch("/api/directory", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as SearchOpportunitiesResponse;
        if (data.records.length === 0) return;

        const curated = filterPublicRecords(data.records);
        setRecords(curated);
        setMetrics(data.metrics);
        saveDirectoryToSession({
          records: data.records,
          groupedEvents: data.groupedEvents,
          metrics: data.metrics,
        });
        await fetchInsights();
      } catch {
        // Non-blocking — user can refresh manually.
      }
    }

    async function init() {
      try {
        const stored = sessionStorage.getItem(DIRECTORY_SESSION_KEY);
        if (stored) {
          const data = JSON.parse(stored) as DirectoryState;
          const curated = filterPublicRecords(data.records ?? []);
          if (curated.length > 0) {
            setRecords(curated);
            setMetrics(data.metrics ?? null);
          } else {
            await loadStarterDirectory();
          }
        } else {
          await loadStarterDirectory();
        }
      } catch {
        await loadStarterDirectory();
      }

      await fetchInsights();
    }

    init();
  }, [fetchInsights]);

  const refreshPublicResults = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setEmptyMessage(null);

    try {
      const response = await fetch("/api/search-opportunities", {
        cache: "no-store",
      });
      const responseText = await response.text();
      let data: SearchOpportunitiesResponse | null = null;

      try {
        data = JSON.parse(responseText) as SearchOpportunitiesResponse;
      } catch {
        setError("Server returned an invalid response. Restart the dev server.");
        setRecords([]);
        return;
      }

      if (!response.ok) {
        setError(
          data.error ??
            "Unable to fetch public opportunities. Check server configuration."
        );
        setRecords([]);
        return;
      }

      if (data.records.length === 0) {
        setRecords([]);
        setMetrics(data.metrics);
        setEmptyMessage(
          data.message ?? "No public results found yet. Try refreshing later."
        );
        await fetchInsights();
        return;
      }

      setRecords(filterPublicRecords(data.records));
      setMetrics(data.metrics);
      saveDirectoryToSession({
        records: data.records,
        groupedEvents: data.groupedEvents,
        metrics: data.metrics,
      });
      await fetchInsights();
    } catch (fetchError) {
      const message =
        fetchError instanceof Error ? fetchError.message : "Network error";
      setError(`Unable to reach the search API: ${message}`);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchInsights]);

  const followRecord = useCallback(
    async (record: AccessRecord) => {
      const next = new Set(followedIds);
      next.add(record.id);
      setFollowedIds(next);
      saveFollowedToLocal(next);
      await postEngagement("follow", record);
    },
    [followedIds, postEngagement]
  );

  const requestUpdates = useCallback(
    async (record: AccessRecord) => {
      await postEngagement("request-update", record);
    },
    [postEngagement]
  );

  const trackView = useCallback(
    async (record: AccessRecord) => {
      await postEngagement("view", record);
    },
    [postEngagement]
  );

  const value = useMemo(
    () => ({
      records,
      metrics,
      insights: insights ?? defaultInsights,
      isLoading,
      error,
      emptyMessage,
      refreshPublicResults,
      followedIds,
      isFollowed: (recordId: string) => followedIds.has(recordId),
      followRecord,
      requestUpdates,
      trackView,
    }),
    [
      records,
      metrics,
      insights,
      isLoading,
      error,
      emptyMessage,
      refreshPublicResults,
      followedIds,
      followRecord,
      requestUpdates,
      trackView,
    ]
  );

  return <HomeContext.Provider value={value}>{children}</HomeContext.Provider>;
}

export function useHome() {
  const context = useContext(HomeContext);
  if (!context) {
    throw new Error("useHome must be used within HomeProvider");
  }
  return context;
}
