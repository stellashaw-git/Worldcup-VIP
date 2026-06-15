export const MEMBER_ROLES = [
  "Founder",
  "Investor",
  "Operator",
  "Creator",
  "Brand",
  "Other",
] as const;

export type MemberRole = (typeof MEMBER_ROLES)[number];

export const MEMBER_INTERESTS = [
  "Watch gatherings",
  "Private viewings",
  "Hospitality",
  "Private dinners",
  "Brand experiences",
] as const;

export type MemberInterest = (typeof MEMBER_INTERESTS)[number];

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
  "member-application",
  "event-interest",
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

export type MemberApplicationLead = {
  id: string;
  type: "member-application";
  name: string;
  email: string;
  linkedin: string;
  role: MemberRole;
  interests: MemberInterest[];
  note: string | null;
  createdAt: string;
};

export type EventInterestLead = {
  id: string;
  type: "event-interest";
  email: string;
  eventId: string;
  eventTitle: string;
  name: string | null;
  createdAt: string;
};

export type Lead =
  | PlatformWaitlistLead
  | AccessRequestLead
  | ListingSubmissionLead
  | MemberApplicationLead
  | EventInterestLead;

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

export type CreateMemberApplicationBody = {
  type: "member-application";
  name: string;
  email: string;
  linkedin: string;
  role: MemberRole;
  interests: MemberInterest[];
  note?: string;
};

export type CreateEventInterestBody = {
  type: "event-interest";
  email: string;
  eventId: string;
  eventTitle: string;
  name?: string;
};

export type CreateLeadBody =
  | CreatePlatformWaitlistBody
  | CreateAccessRequestBody
  | CreateListingSubmissionBody
  | CreateMemberApplicationBody
  | CreateEventInterestBody;
