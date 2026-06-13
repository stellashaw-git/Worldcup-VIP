import type { AccessType, Availability, SourceType } from "@/lib/opportunities/types";

export type OfficialListing = {
  matchName: string;
  matchCode?: string;
  matchStage: string;
  matchStageDetail?: string;
  eventDate: string;
  kickoffTime?: string;
  hostCity: string;
  venue: string;
  teams?: string;
  accessType: AccessType;
  hospitalityProduct?: string;
  productName?: string;
  priceMin: number | null;
  priceMax: number | null;
  currency: string;
  capacity?: string;
  availability: Availability;
  sourceName: string;
  sourceType: SourceType;
  sourceUrl: string;
};

export const FIFA_CHOOSE_MATCHES_URL =
  "https://fifaworldcup26.hospitality.fifa.com/us/en/choose-matches";

export const ON_LOCATION_URLS = [
  "https://www.onlocationexp.com/fifa-world-cup-2026",
  "https://onlocationexp.com/fifa-world-cup-2026",
  "https://www.onlocationexp.com/events/fifa-world-cup-2026",
  "https://onlocationexp.com/events/fifa-world-cup-2026",
] as const;

export type ExtractionMethod = "playwright" | "paste" | "failed";

export type OfficialExtractionResult = {
  listings: OfficialListing[];
  method: ExtractionMethod;
  sourceUrl: string;
  error?: string;
};
