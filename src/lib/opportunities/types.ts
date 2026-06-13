export const MATCH_STAGES = [
  "Opening Match",
  "Group Stage",
  "Round of 32",
  "Round of 16",
  "Quarter Final",
  "Semi Final",
  "Third Place Match",
  "Final",
  "Unknown",
] as const;

export type MatchStage = (typeof MATCH_STAGES)[number];

export const ACCESS_TYPES = [
  "Suite",
  "Shared Suite",
  "Lounge",
  "Club Seat",
  "Hospitality Package",
  "VIP Experience",
  "Travel Package",
  "Private Event",
  "Unknown",
] as const;

export type AccessType = (typeof ACCESS_TYPES)[number];

export const HOSPITALITY_CATEGORIES = [
  "FIFA Hospitality",
  "Official Venue",
  "Broker / Reseller",
  "Travel Partner",
  "Media / Listing",
  "Unknown",
] as const;

export type HospitalityCategory = (typeof HOSPITALITY_CATEGORIES)[number];

export const AVAILABILITY_OPTIONS = [
  "Available",
  "Limited",
  "Inquiry Required",
  "Waitlist",
  "Unknown",
] as const;

export type Availability = (typeof AVAILABILITY_OPTIONS)[number];

export const SOURCE_TYPES = [
  "Official FIFA Hospitality",
  "Official On Location",
  "Official Venue",
  "Official Partner",
  "Official FIFA",
  "Official Hospitality Provider",
  "Travel Partner",
  "Premium Ticket Provider",
  "Hospitality Company",
] as const;

export type SourceType = (typeof SOURCE_TYPES)[number];

export const REVIEW_STATUSES = [
  "Needs Review",
  "Approved",
  "Rejected",
] as const;

export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export type ReviewQueueItem = {
  id: string;
  status: ReviewStatus;
  title: string;
  sourceUrl: string;
  sourceName: string;
  category: AccessType;
  city: string | null;
  venue: string | null;
  eventDate: string | null;
  priceMin: number | null;
  priceMax: number | null;
  currency: string;
  lowConfidenceReason: string;
  rawSummary: string;
  confidenceScore: number;
  sourceType: SourceType;
  recordDraft: AccessRecord;
  createdAt: string;
  updatedAt: string;
};

export type AccessRecord = {
  id: string;
  slug: string;
  groupKey: string;
  matchName: string;
  matchStage: MatchStage;
  matchStageDetail?: string;
  matchCode?: string;
  kickoffTime?: string;
  teams?: string;
  city: string;
  venue: string;
  eventDate: string;
  accessType: AccessType;
  hospitalityCategory: HospitalityCategory;
  hospitalityProduct?: string;
  productName?: string;
  capacity: string;
  priceMin: number | null;
  priceMax: number | null;
  currency: string;
  availability: Availability;
  sourceName: string;
  sourceType: SourceType;
  sourceUrl: string;
  lastUpdated: string;
  summary: string;
  confidenceScore: number;
  actionLabel?: string;
};

export type SourceOffering = {
  recordId: string;
  slug: string;
  sourceName: string;
  sourceUrl: string;
  accessType: AccessType;
  hospitalityCategory: HospitalityCategory;
  priceMin: number | null;
  priceMax: number | null;
  currency: string;
  availability: Availability;
  capacity: string;
};

export type GroupedEvent = {
  groupKey: string;
  matchName: string;
  matchStage: MatchStage;
  city: string;
  venue: string;
  eventDate: string;
  offerings: SourceOffering[];
};

export type DirectoryMetrics = {
  totalOpportunities: number;
  citiesCovered: number;
  matchesCovered: number;
  latestUpdate: string | null;
  averagePriceMin: number | null;
  averagePriceMax: number | null;
  currency: string;
};

export type SearchOpportunitiesResponse = {
  records: AccessRecord[];
  groupedEvents: GroupedEvent[];
  metrics: DirectoryMetrics;
  error?: string;
  message?: string;
};
