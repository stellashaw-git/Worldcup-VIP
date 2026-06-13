import { createHash } from "crypto";
import { buildGroupKey } from "@/lib/opportunities/extract";
import type { AccessRecord, MatchStage } from "@/lib/opportunities/types";
import { isOfficialHighTrustSource } from "@/lib/opportunities/official-quality";
import type { OfficialListing } from "@/lib/official-sources/types";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

function createId(sourceUrl: string, matchName: string): string {
  return createHash("sha256")
    .update(`${sourceUrl}|${matchName}`)
    .digest("hex")
    .slice(0, 12);
}

function mapKnownStage(stage: string): MatchStage {
  const known: Record<string, MatchStage> = {
    Final: "Final",
    "Semi Final": "Semi Final",
    "Quarter Final": "Quarter Final",
    "Round of 16": "Round of 16",
    "Round of 32": "Round of 32",
    "Opening Match": "Opening Match",
    "Third Place Match": "Third Place Match",
    "Group Stage": "Group Stage",
  };
  return known[stage] ?? "Unknown";
}

function buildSummary(listing: OfficialListing): string {
  const parts = [
    listing.matchName,
    listing.matchStageDetail ?? listing.matchStage,
    listing.eventDate,
    listing.kickoffTime,
    listing.hostCity,
    listing.venue,
    listing.productName,
    listing.priceMin
      ? `Starting at $${listing.priceMin.toLocaleString()} ${listing.currency}`
      : null,
  ].filter(Boolean);
  return parts.join(" · ");
}

export function officialListingToAccessRecord(
  listing: OfficialListing,
  lastUpdated: string
): AccessRecord {
  const id = createId(listing.sourceUrl, listing.matchName);
  const slug = `${slugify(listing.matchName)}-${id}`;
  const city = listing.hostCity !== "Unknown" ? listing.hostCity : "Unknown";
  const venue = listing.venue !== "Unknown" ? listing.venue : "Unknown";
  const eventDate =
    listing.eventDate !== "Unknown" ? listing.eventDate : "Unknown";

  const groupKey =
    buildGroupKey(listing.matchName, venue, eventDate) || `official-${id}`;

  const confidenceScore = isOfficialHighTrustSource(listing.sourceType) ? 95 : 85;

  return {
    id,
    slug,
    groupKey,
    matchName: listing.matchName,
    matchStage: mapKnownStage(listing.matchStage),
    matchStageDetail: listing.matchStageDetail,
    matchCode: listing.matchCode,
    kickoffTime: listing.kickoffTime,
    teams: listing.teams,
    city,
    venue,
    eventDate,
    accessType: listing.accessType,
    hospitalityCategory: "FIFA Hospitality",
    hospitalityProduct: listing.hospitalityProduct,
    productName: listing.productName ?? listing.matchName,
    capacity: listing.capacity ?? "Unknown",
    priceMin: listing.priceMin,
    priceMax: listing.priceMax,
    currency: listing.currency,
    availability: listing.availability,
    sourceName: listing.sourceName,
    sourceType: listing.sourceType,
    sourceUrl: listing.sourceUrl,
    lastUpdated,
    summary: buildSummary(listing),
    confidenceScore,
  };
}

export function dedupeOfficialRecords(records: AccessRecord[]): AccessRecord[] {
  const byKey = new Map<string, AccessRecord>();
  for (const record of records) {
    const key = `${record.sourceUrl}|${record.matchName}`;
    byKey.set(key, record);
  }
  return Array.from(byKey.values());
}
