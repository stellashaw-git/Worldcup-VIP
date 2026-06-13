import {
  dedupeOfficialRecords,
  officialListingToAccessRecord,
} from "@/lib/official-sources/convert";
import { parseOfficialListingText } from "@/lib/official-sources/parse-listing-text";
import {
  EXTRACTION_TIMEOUT_MS,
  withTimeout,
} from "@/lib/official-sources/timeout";
import type { OfficialListing } from "@/lib/official-sources/types";
import type { AccessRecord } from "@/lib/opportunities/types";

export type OfficialPipelineResult = {
  records: AccessRecord[];
  fifa: { count: number; method: string; error?: string };
  onLocation: { count: number; method: string; error?: string };
  totalListings: number;
};

const VERCEL_SKIP_MESSAGE =
  "Playwright scraping disabled on Vercel. Use starter directory or /admin/import.";

function emptyOfficialResult(error?: string): OfficialPipelineResult {
  return {
    records: [],
    fifa: {
      count: 0,
      method: "skipped",
      error: error ?? VERCEL_SKIP_MESSAGE,
    },
    onLocation: {
      count: 0,
      method: "skipped",
      error: error ?? VERCEL_SKIP_MESSAGE,
    },
    totalListings: 0,
  };
}

export async function runOfficialExtractors(
  lastUpdated: string
): Promise<OfficialPipelineResult> {
  if (process.env.VERCEL) {
    return emptyOfficialResult();
  }

  try {
    return await withTimeout(
      runOfficialExtractorsInner(lastUpdated),
      EXTRACTION_TIMEOUT_MS,
      "Official source extraction"
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Official extraction failed";
    console.warn("[BLACKBOOK] Official extractors skipped:", message);
    return emptyOfficialResult(message);
  }
}

async function runOfficialExtractorsInner(
  lastUpdated: string
): Promise<OfficialPipelineResult> {
  const { extractFifaHospitality } = await import("@/lib/official-sources/fifa");
  const { extractOnLocation } = await import(
    "@/lib/official-sources/on-location"
  );

  const fifaResult = await extractFifaHospitality();
  const onLocationResult = await extractOnLocation();

  const listings: OfficialListing[] = [
    ...fifaResult.listings,
    ...onLocationResult.listings,
  ];

  const records = dedupeOfficialRecords(
    listings.map((listing) => officialListingToAccessRecord(listing, lastUpdated))
  );

  console.info(
    `[BLACKBOOK] Official extractors: FIFA ${fifaResult.listings.length} (${fifaResult.method}), On Location ${onLocationResult.listings.length} (${onLocationResult.method}), public records ${records.length}`
  );

  if (fifaResult.error) {
    console.warn("[BLACKBOOK] FIFA extraction:", fifaResult.error);
  }
  if (onLocationResult.error) {
    console.warn("[BLACKBOOK] On Location extraction:", onLocationResult.error);
  }

  return {
    records,
    fifa: {
      count: fifaResult.listings.length,
      method: fifaResult.method,
      error: fifaResult.error,
    },
    onLocation: {
      count: onLocationResult.listings.length,
      method: onLocationResult.method,
      error: onLocationResult.error,
    },
    totalListings: listings.length,
  };
}

export function parsePastedOfficialText(
  text: string,
  defaults: Pick<OfficialListing, "sourceName" | "sourceType" | "sourceUrl">,
  lastUpdated: string
): AccessRecord[] {
  const listings = parseOfficialListingText(text, defaults);
  return dedupeOfficialRecords(
    listings.map((listing) => officialListingToAccessRecord(listing, lastUpdated))
  );
}
