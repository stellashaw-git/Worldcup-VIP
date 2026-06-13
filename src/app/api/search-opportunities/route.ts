import { NextResponse } from "next/server";
import { setDirectoryCache } from "@/lib/opportunities/cache";
import {
  computeDirectoryMetrics,
  groupRecords,
} from "@/lib/opportunities/group";
import { mergeOfficialAndDiscovered } from "@/lib/opportunities/official-quality";
import {
  prepareTavilyResults,
  processSearchResults,
} from "@/lib/opportunities/normalize";
import { mergeStarterRecords } from "@/lib/opportunities/starter-directory";
import type { SearchOpportunitiesResponse } from "@/lib/opportunities/types";
import { runOfficialExtractors } from "@/lib/official-sources/run";
import {
  mergePublicRecords,
  upsertReviewQueueItems,
} from "@/lib/review-queue/store";
import { runAllTavilySearches } from "@/lib/tavily/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 180;

const EMPTY_METRICS = {
  totalOpportunities: 0,
  citiesCovered: 0,
  matchesCovered: 0,
  latestUpdate: null,
  averagePriceMin: null,
  averagePriceMax: null,
  currency: "USD",
};

function getTavilyApiKey(): string | undefined {
  const apiKey = process.env.TAVILY_API_KEY?.trim();
  return apiKey && apiKey.length > 0 ? apiKey : undefined;
}

export async function GET() {
  const lastUpdated = new Date().toISOString();
  const messages: string[] = [];

  try {
    const official = await runOfficialExtractors(lastUpdated);
    let discoveredPublic: SearchOpportunitiesResponse["records"] = [];
    let reviewQueueCount = 0;

    const apiKey = getTavilyApiKey();
    if (apiKey) {
      try {
        const rawResults = await runAllTavilySearches(apiKey);
        const { results: packageResults, discardedArticles } =
          prepareTavilyResults(rawResults);
        const { publicRecords, reviewQueueItems, stats } = processSearchResults(
          packageResults,
          lastUpdated,
          discardedArticles
        );
        await upsertReviewQueueItems(reviewQueueItems);
        discoveredPublic = publicRecords;
        reviewQueueCount = stats.reviewQueue;
      } catch (tavilyError) {
        const message =
          tavilyError instanceof Error
            ? tavilyError.message
            : "Tavily discovery failed";
        console.warn("[BLACKBOOK] Tavily discovery skipped:", message);
        messages.push(`Tavily discovery skipped: ${message}`);
      }
    } else {
      messages.push(
        "Tavily not configured — using official extractors only for this refresh."
      );
    }

    const mergedAuto = mergeOfficialAndDiscovered(
      official.records,
      discoveredPublic
    );
    const records = mergeStarterRecords(await mergePublicRecords(mergedAuto));
    const groupedEvents = groupRecords(records);
    const metrics = computeDirectoryMetrics(records);

    const response: SearchOpportunitiesResponse = {
      records,
      groupedEvents,
      metrics,
    };

    setDirectoryCache({ records, groupedEvents, metrics });

    console.info(
      `[BLACKBOOK] Directory: ${records.length} total (${official.records.length} official + ${discoveredPublic.length} discovered)`
    );

    if (official.fifa.error) {
      messages.push(
        `FIFA scrape: ${official.fifa.error}. Paste listings at /admin/import if needed.`
      );
    }
    if (official.onLocation.error) {
      messages.push(`On Location scrape: ${official.onLocation.error}`);
    }

    if (records.length === 0) {
      return NextResponse.json<SearchOpportunitiesResponse>({
        ...response,
        message:
          messages.join(" ") ||
          (reviewQueueCount > 0
            ? `${reviewQueueCount} leads in review queue. Official scrape may have failed — use /admin/import to paste FIFA listings.`
            : "No records yet. Try /admin/import to paste official FIFA match listings."),
      });
    }

    if (messages.length > 0) {
      return NextResponse.json<SearchOpportunitiesResponse>({
        ...response,
        message: messages.join(" "),
      });
    }

    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Pipeline refresh failed";
    console.error("[BLACKBOOK] Refresh failed:", message);

    return NextResponse.json<SearchOpportunitiesResponse>(
      {
        records: [],
        groupedEvents: [],
        metrics: EMPTY_METRICS,
        error: `Unable to refresh opportunities: ${message}`,
      },
      { status: 500 }
    );
  }
}
