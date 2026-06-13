import { extractPageText } from "@/lib/official-sources/browser";
import { parseOfficialListingText } from "@/lib/official-sources/parse-listing-text";
import {
  ON_LOCATION_URLS,
  type OfficialExtractionResult,
  type OfficialListing,
} from "@/lib/official-sources/types";

export async function extractOnLocation(): Promise<OfficialExtractionResult> {
  const errors: string[] = [];
  const allListings: OfficialListing[] = [];
  let successUrl: string | undefined;

  for (const url of ON_LOCATION_URLS) {
    try {
      const pageText = await extractPageText(url);
      const listings = parseOfficialListingText(pageText, {
        sourceName: "On Location",
        sourceType: "Official On Location",
        sourceUrl: url,
      });

      if (listings.length > 0) {
        allListings.push(...listings);
        successUrl = url;
        break;
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "On Location extraction failed";
      errors.push(`${url}: ${message}`);
    }
  }

  if (allListings.length === 0) {
    return {
      listings: [],
      method: "failed",
      sourceUrl: ON_LOCATION_URLS[0],
      error: errors.join("; ") || "No listings parsed from On Location pages",
    };
  }

  return {
    listings: allListings,
    method: "playwright",
    sourceUrl: successUrl ?? ON_LOCATION_URLS[0],
  };
}
