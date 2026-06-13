import { extractAccessRecord, type TavilyResult } from "@/lib/opportunities/extract";
import { filterAndRankPackageListings } from "@/lib/opportunities/package-filter";
import {
  buildLowConfidenceReason,
  isAutoPublicRecord,
  isReviewQueueEligible,
  passesPublicRelaxedCriteria,
  sanitizePageTitle,
  type PipelineStats,
} from "@/lib/opportunities/quality";
import {
  classifySource,
  isBlacklistedSource,
} from "@/lib/opportunities/sources";
import type { AccessRecord, ReviewQueueItem } from "@/lib/opportunities/types";

export function dedupeTavilyResults(results: TavilyResult[]): TavilyResult[] {
  const seen = new Set<string>();

  return results.filter((result) => {
    if (!result.url || seen.has(result.url)) {
      return false;
    }
    seen.add(result.url);
    return true;
  });
}

export function prepareTavilyResults(results: TavilyResult[]): {
  results: TavilyResult[];
  discardedArticles: number;
} {
  const unique = dedupeTavilyResults(results);
  const { results: ranked, discardedArticles } =
    filterAndRankPackageListings(unique);

  if (discardedArticles > 0) {
    console.info(
      `[BLACKBOOK] Package filter: discarded ${discardedArticles} article/low-signal pages`
    );
  }

  return { results: ranked, discardedArticles };
}

function buildReviewQueueItem(
  result: TavilyResult,
  record: AccessRecord,
  rawSummary: string
): ReviewQueueItem {
  const passesPublic = passesPublicRelaxedCriteria(record);
  const title =
    record.matchName !== "Unknown"
      ? record.matchName
      : sanitizePageTitle(result.title) || "Untitled Lead";

  const now = new Date().toISOString();

  return {
    id: record.id,
    status: "Needs Review",
    title,
    sourceUrl: record.sourceUrl,
    sourceName: record.sourceName,
    category: record.accessType,
    city: record.city !== "Unknown" ? record.city : null,
    venue: record.venue !== "Unknown" ? record.venue : null,
    eventDate: record.eventDate !== "Unknown" ? record.eventDate : null,
    priceMin: record.priceMin,
    priceMax: record.priceMax,
    currency: record.currency,
    lowConfidenceReason: buildLowConfidenceReason(record, passesPublic),
    rawSummary,
    confidenceScore: record.confidenceScore,
    sourceType: record.sourceType,
    recordDraft: record,
    createdAt: now,
    updatedAt: now,
  };
}

export function processSearchResults(
  results: TavilyResult[],
  lastUpdated: string,
  discardedArticles = 0
): {
  publicRecords: AccessRecord[];
  reviewQueueItems: ReviewQueueItem[];
  stats: PipelineStats;
} {
  const stats: PipelineStats = {
    total: results.length,
    publicAuto: 0,
    reviewQueue: 0,
    discardedBlacklist: 0,
    discardedNotWhitelisted: 0,
    discardedNoSignal: 0,
    discardedArticles,
  };

  const publicRecords: AccessRecord[] = [];
  const reviewQueueItems: ReviewQueueItem[] = [];

  for (const result of results) {
    if (isBlacklistedSource(result.url)) {
      stats.discardedBlacklist += 1;
      continue;
    }

    if (!classifySource(result.url)) {
      stats.discardedNotWhitelisted += 1;
      continue;
    }

    const extracted = extractAccessRecord(result, lastUpdated);
    if (!extracted) {
      stats.discardedNotWhitelisted += 1;
      continue;
    }

    const { record, rawSummary } = extracted;

    if (!isReviewQueueEligible(record)) {
      stats.discardedNoSignal += 1;
      continue;
    }

    if (isAutoPublicRecord(record)) {
      stats.publicAuto += 1;
      publicRecords.push(record);
      continue;
    }

    stats.reviewQueue += 1;
    reviewQueueItems.push(buildReviewQueueItem(result, record, rawSummary));
  }

  if (stats.total > 0) {
    console.info(
      `[BLACKBOOK] Pipeline: ${stats.publicAuto} public, ${stats.reviewQueue} review queue, discarded ${stats.discardedBlacklist + stats.discardedNotWhitelisted + stats.discardedNoSignal}`,
      stats
    );
  }

  return { publicRecords, reviewQueueItems, stats };
}

// Legacy export for any remaining references
export function normalizeTavilyResults(
  results: TavilyResult[],
  lastUpdated: string
): AccessRecord[] {
  return processSearchResults(results, lastUpdated).publicRecords;
}
