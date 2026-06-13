import { BLACKLIST_DOMAINS } from "@/lib/opportunities/sources";
import {
  ALL_SITE_SEARCH_QUERIES,
  type SiteSearchQuery,
} from "@/lib/tavily/search-config";

const TAVILY_SEARCH_URL = "https://api.tavily.com/search";

const BATCH_SIZE = 2;
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_RESULTS_PER_QUERY = 5;

export type TavilySearchResult = {
  title: string;
  url: string;
  content: string;
  score: number;
};

type TavilySearchResponse = {
  results: TavilySearchResult[];
};

export async function runTavilySiteSearch(
  siteQuery: SiteSearchQuery,
  apiKey: string
): Promise<TavilySearchResult[]> {
  const response = await fetch(TAVILY_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query: siteQuery.query,
      search_depth: "advanced",
      max_results: MAX_RESULTS_PER_QUERY,
      topic: "general",
      include_domains: [siteQuery.domain],
      exclude_domains: BLACKLIST_DOMAINS,
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Tavily search failed for ${siteQuery.domain} (${response.status}): ${errorText.slice(0, 200)}`
    );
  }

  const data = (await response.json()) as TavilySearchResponse;
  return data.results ?? [];
}

export async function runAllTavilySearches(apiKey: string) {
  const allResults: TavilySearchResult[] = [];
  const errors: string[] = [];

  for (let index = 0; index < ALL_SITE_SEARCH_QUERIES.length; index += BATCH_SIZE) {
    const batch = ALL_SITE_SEARCH_QUERIES.slice(index, index + BATCH_SIZE);
    const batchResults = await Promise.allSettled(
      batch.map((siteQuery) => runTavilySiteSearch(siteQuery, apiKey))
    );

    for (let i = 0; i < batchResults.length; i += 1) {
      const result = batchResults[i];
      const siteQuery = batch[i];

      if (result.status === "fulfilled") {
        allResults.push(...result.value);
        console.info(
          `[BLACKBOOK] ${siteQuery.domain}: ${result.value.length} results`
        );
      } else {
        const message =
          result.reason instanceof Error
            ? result.reason.message
            : "Unknown Tavily error";
        errors.push(`${siteQuery.domain}: ${message}`);
        console.warn(
          `[BLACKBOOK] Tavily query failed for ${siteQuery.domain}:`,
          message
        );
      }
    }
  }

  if (allResults.length === 0) {
    throw new Error(
      errors[0] ?? "Tavily returned no results for any site-targeted query."
    );
  }

  return allResults;
}
