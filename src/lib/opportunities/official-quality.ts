import type { AccessRecord, SourceType } from "@/lib/opportunities/types";
import {
  isCityIdentified,
  isDateIdentified,
  isPriceIdentified,
  isVenueIdentified,
} from "@/lib/opportunities/quality";

export const OFFICIAL_HIGH_TRUST_SOURCE_TYPES: SourceType[] = [
  "Official FIFA Hospitality",
  "Official On Location",
  "Official Venue",
  "Official Partner",
];

export function isOfficialHighTrustSource(sourceType: SourceType): boolean {
  return OFFICIAL_HIGH_TRUST_SOURCE_TYPES.includes(sourceType);
}

export function passesOfficialSourceCriteria(record: AccessRecord): boolean {
  if (!isOfficialHighTrustSource(record.sourceType)) {
    return false;
  }

  const hasName =
    record.matchName !== "Unknown" ||
    (record.productName && record.productName !== "Unknown");

  if (!hasName || !record.sourceUrl) {
    return false;
  }

  return (
    isCityIdentified(record.city) ||
    isVenueIdentified(record.venue) ||
    isPriceIdentified(record.priceMin, record.priceMax) ||
    isDateIdentified(record.eventDate)
  );
}

export function isOfficialAutoPublic(record: AccessRecord): boolean {
  return passesOfficialSourceCriteria(record);
}

export function mergeOfficialAndDiscovered(
  official: AccessRecord[],
  discovered: AccessRecord[]
): AccessRecord[] {
  const officialKeys = new Set(
    official.map((r) => `${r.sourceUrl}|${r.matchName}`)
  );
  const merged = [...official];
  for (const record of discovered) {
    const key = `${record.sourceUrl}|${record.matchName}`;
    if (!officialKeys.has(key)) {
      merged.push(record);
    }
  }
  return merged;
}
