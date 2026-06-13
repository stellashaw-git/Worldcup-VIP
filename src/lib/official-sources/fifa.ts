import { extractPageText } from "@/lib/official-sources/browser";
import { parseOfficialListingText } from "@/lib/official-sources/parse-listing-text";
import {
  FIFA_CHOOSE_MATCHES_URL,
  type OfficialExtractionResult,
} from "@/lib/official-sources/types";

export async function extractFifaHospitality(): Promise<OfficialExtractionResult> {
  try {
    const pageText = await extractPageText(FIFA_CHOOSE_MATCHES_URL);
    const listings = parseOfficialListingText(pageText, {
      sourceName: "FIFA Hospitality",
      sourceType: "Official FIFA Hospitality",
      sourceUrl: FIFA_CHOOSE_MATCHES_URL,
    });

    if (listings.length === 0) {
      return {
        listings: [],
        method: "failed",
        sourceUrl: FIFA_CHOOSE_MATCHES_URL,
        error: "No match listings parsed from FIFA page text",
      };
    }

    return {
      listings,
      method: "playwright",
      sourceUrl: FIFA_CHOOSE_MATCHES_URL,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "FIFA extraction failed";
    return {
      listings: [],
      method: "failed",
      sourceUrl: FIFA_CHOOSE_MATCHES_URL,
      error: message,
    };
  }
}
