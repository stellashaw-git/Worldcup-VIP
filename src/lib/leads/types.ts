export const US_HOST_CITIES = [
  "New York / NJ",
  "Philadelphia",
  "Boston",
  "Miami",
  "Atlanta",
  "Dallas",
  "Houston",
  "Kansas City",
  "Seattle",
  "San Francisco",
  "Los Angeles",
  "Other US city",
  "Outside US",
] as const;

export type HostCityOption = (typeof US_HOST_CITIES)[number];

export const LEAD_TYPES = [
  "platform-waitlist",
  "access-request",
  "listing-submission",
] as const;

export type LeadType = (typeof LEAD_TYPES)[number];

export type PlatformWaitlistLead = {
  id: string;
  type: "platform-waitlist";
  email: string;
  city: HostCityOption;
  nycPlusInterest: boolean;
  createdAt: string;
};

export type AccessRequestLead = {
  id: string;
  type: "access-request";
  email: string;
  recordId: string;
  recordTitle: string;
  city: string;
  message: string | null;
  createdAt: string;
};

export type ListingSubmissionLead = {
  id: string;
  type: "listing-submission";
  submitterName: string;
  submitterEmail: string;
  organization: string | null;
  listingTitle: string;
  listingType: string;
  city: string;
  eventDate: string | null;
  description: string;
  listingUrl: string | null;
  priceRange: string | null;
  createdAt: string;
};

export type Lead =
  | PlatformWaitlistLead
  | AccessRequestLead
  | ListingSubmissionLead;

export type CreatePlatformWaitlistBody = {
  type: "platform-waitlist";
  email: string;
  city: HostCityOption;
  nycPlusInterest?: boolean;
};

export type CreateAccessRequestBody = {
  type: "access-request";
  email: string;
  recordId: string;
  recordTitle: string;
  city: string;
  message?: string;
};

export type CreateListingSubmissionBody = {
  type: "listing-submission";
  submitterName: string;
  submitterEmail: string;
  organization?: string;
  listingTitle: string;
  listingType: string;
  city: string;
  eventDate?: string;
  description: string;
  listingUrl?: string;
  priceRange?: string;
};

export type CreateLeadBody =
  | CreatePlatformWaitlistBody
  | CreateAccessRequestBody
  | CreateListingSubmissionBody;
