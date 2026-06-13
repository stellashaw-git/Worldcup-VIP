import type {
  AccessRecord,
  AccessType,
  ReviewQueueItem,
  ReviewStatus,
} from "@/lib/opportunities/types";

import {
  isOfficialAutoPublic,
} from "@/lib/opportunities/official-quality";

export const PUBLIC_CONFIDENCE_THRESHOLD = 70;

export function reviewItemToAccessRecord(
  item: ReviewQueueItem,
  edits?: Partial<AccessRecord>
): AccessRecord {
  const draft = item.recordDraft;
  const matchName = edits?.matchName ?? item.title;

  return {
    ...draft,
    ...edits,
    matchName,
    slug: edits?.slug ?? draft.slug,
    groupKey: edits?.groupKey ?? draft.groupKey,
    confidenceScore: Math.max(
      edits?.confidenceScore ?? draft.confidenceScore,
      PUBLIC_CONFIDENCE_THRESHOLD
    ),
    lastUpdated: new Date().toISOString(),
  };
}

export function buildLowConfidenceReason(
  record: AccessRecord,
  passesPublic: boolean
): string {
  const reasons: string[] = [];

  if (record.confidenceScore < PUBLIC_CONFIDENCE_THRESHOLD) {
    reasons.push(
      `Confidence score ${record.confidenceScore} (below ${PUBLIC_CONFIDENCE_THRESHOLD})`
    );
  }

  if (record.accessType === "Unknown") {
    reasons.push("Category not identified");
  }

  if (!hasLocationOrPriceOrDate(record)) {
    reasons.push("Missing city, venue, price, and date");
  }

  if (!passesPublic && reasons.length === 0) {
    reasons.push("Did not meet auto-publish criteria");
  }

  return reasons.join("; ");
}

export function hasLocationOrPriceOrDate(
  record: Pick<
    AccessRecord,
    "city" | "venue" | "eventDate" | "priceMin" | "priceMax"
  >
): boolean {
  return (
    isCityIdentified(record.city) ||
    isVenueIdentified(record.venue) ||
    isPriceIdentified(record.priceMin, record.priceMax) ||
    isDateIdentified(record.eventDate)
  );
}

export function isDateIdentified(eventDate: string): boolean {
  return eventDate !== "Unknown" && eventDate !== "2026 — Date Unknown";
}

export function isCityIdentified(city: string): boolean {
  return city !== "Unknown";
}

export function isVenueIdentified(venue: string): boolean {
  return venue !== "Unknown";
}

export function isPriceIdentified(
  priceMin: number | null,
  priceMax: number | null
): boolean {
  return priceMin !== null || priceMax !== null;
}

export function isCapacityIdentified(capacity: string): boolean {
  return capacity !== "Unknown";
}

export function passesPublicRelaxedCriteria(record: AccessRecord): boolean {
  if (record.accessType === "Unknown") {
    return false;
  }

  return hasLocationOrPriceOrDate(record);
}

export function isAutoPublicRecord(record: AccessRecord): boolean {
  if (isOfficialAutoPublic(record)) {
    return true;
  }

  return (
    record.confidenceScore >= PUBLIC_CONFIDENCE_THRESHOLD &&
    passesPublicRelaxedCriteria(record) &&
    !isGenericTitle(record.matchName)
  );
}

export function isReviewQueueEligible(record: AccessRecord): boolean {
  const hasCategory = record.accessType !== "Unknown";
  return hasCategory || hasLocationOrPriceOrDate(record);
}

export function deriveReviewStatus(record: AccessRecord): ReviewStatus {
  if (isAutoPublicRecord(record)) {
    return "Approved";
  }
  return "Needs Review";
}

// Kept for pipeline stats / future use
export function acceptRecord(record: AccessRecord): boolean {
  return isAutoPublicRecord(record);
}

const GENERIC_TITLE_PATTERNS = [
  /discussion/i,
  /\breddit\b/i,
  /\bquora\b/i,
  /best\s+(fifa|world cup|package|hospitality)/i,
  /up to \$/i,
  /cost for/i,
  /\?$/,
  /^how\s+/i,
  /^what\s+/i,
  /^why\s+/i,
  /^when\s+/i,
  /^is\s+/i,
  /article/i,
  /^news:/i,
  /^\$[\d,]+/,
  /hospitality discussion/i,
  /world cup hospitality discussion/i,
  /^tickets?\s*&\s*hospitality$/i,
  /^vip$/i,
  /^hospitality$/i,
  /personal hospitality package$/i,
  /\btips\b/i,
  /\bguide\b/i,
  /\bopinion\b/i,
  /\bthread\b/i,
  /\bcomments?\b/i,
];

export function isGenericTitle(title: string): boolean {
  const normalized = title.trim();
  if (normalized.length < 6) return true;
  if (normalized.length > 80) return true;
  return GENERIC_TITLE_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function sanitizePageTitle(title: string): string {
  return title
    .replace(/\s*[-|–]\s*.+$/, "")
    .replace(/tickets?\s*&\s*hospitality/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

export function buildStructuredTitle(
  matchStage: AccessRecord["matchStage"],
  accessType: AccessType,
  city: string,
  venue: string
): string | null {
  const ACCESS_LABELS: Partial<Record<AccessType, string>> = {
    Suite: "Executive Suite",
    "Shared Suite": "Shared Suite",
    Lounge: "VIP Lounge Access",
    "Club Seat": "Club Seat Access",
    "Hospitality Package": "Hospitality Package",
    "VIP Experience": "VIP Experience",
    "Travel Package": "Travel Package",
    "Private Event": "Private Event",
  };

  const STAGE_LABELS: Partial<Record<AccessRecord["matchStage"], string>> = {
    Final: "World Cup Final",
    "Semi Final": "Semi Final",
    "Quarter Final": "Quarter Final",
    "Round of 16": "Round of 16",
    "Round of 32": "Round of 32",
    "Opening Match": "Opening Match",
    "Third Place Match": "Third Place Match",
    "Group Stage": "Group Stage",
  };

  const accessLabel =
    accessType !== "Unknown" ? ACCESS_LABELS[accessType] ?? accessType : null;
  const stageLabel =
    matchStage !== "Unknown" ? STAGE_LABELS[matchStage] ?? matchStage : null;

  if (venue !== "Unknown" && accessType === "Suite") {
    return `${venue} Executive Suite`;
  }

  if (venue !== "Unknown" && accessType === "Lounge") {
    return `${venue} VIP Lounge Access`;
  }

  if (venue !== "Unknown" && accessLabel) {
    return `${venue} ${accessLabel}`;
  }

  if (stageLabel && accessType === "Suite") {
    return `${stageLabel} Private Suite`;
  }

  if (stageLabel && accessType === "Hospitality Package") {
    return `${stageLabel} Hospitality`;
  }

  if (stageLabel && accessLabel) {
    return `${stageLabel} ${accessLabel}`;
  }

  if (stageLabel) {
    return `${stageLabel} Hospitality`;
  }

  if (city !== "Unknown" && accessType === "Lounge") {
    return `${city} VIP Lounge Access`;
  }

  if (city !== "Unknown" && accessLabel) {
    return `${city} ${accessLabel}`;
  }

  if (venue !== "Unknown") {
    return `${venue} World Cup Access`;
  }

  return null;
}

export function computeConfidenceScore(
  record: Pick<
    AccessRecord,
    "city" | "venue" | "eventDate" | "priceMin" | "priceMax" | "capacity"
  >,
  sourceTier: "official" | "premium" | "hospitality"
): number {
  let score = 0;
  switch (sourceTier) {
    case "official":
      score += 40;
      break;
    case "premium":
      score += 35;
      break;
    case "hospitality":
      score += 30;
      break;
  }

  if (isDateIdentified(record.eventDate)) score += 15;
  if (isVenueIdentified(record.venue)) score += 15;
  if (isCityIdentified(record.city)) score += 10;
  if (isPriceIdentified(record.priceMin, record.priceMax)) score += 10;
  if (isCapacityIdentified(record.capacity)) score += 10;

  return Math.min(score, 100);
}

export type PipelineStats = {
  total: number;
  publicAuto: number;
  reviewQueue: number;
  discardedBlacklist: number;
  discardedNotWhitelisted: number;
  discardedNoSignal: number;
  discardedArticles: number;
};
