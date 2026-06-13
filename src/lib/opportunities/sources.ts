import type { SourceType } from "@/lib/opportunities/types";

export type SourceTier = "official" | "premium" | "hospitality";

export type SourceClassification = {
  allowed: boolean;
  tier: SourceTier;
  sourceType: SourceType;
  sourceName: string;
  isOfficial: boolean;
};

const BLACKLIST_HOST_PATTERNS = [
  "reddit.com",
  "redd.it",
  "quora.com",
  "twitter.com",
  "x.com",
  "facebook.com",
  "fb.com",
  "instagram.com",
  "tiktok.com",
  "youtube.com",
  "youtu.be",
  "medium.com",
  "blogspot.com",
  "wordpress.com",
  "substack.com",
  "pinterest.com",
  "linkedin.com",
  "tumblr.com",
  "wikipedia.org",
  "news.ycombinator.com",
  "stackexchange.com",
  "stackoverflow.com",
];

const BLACKLIST_HOST_SUBSTRINGS = [
  "forum",
  "forums",
  "discussion",
  "community",
  "blog.",
  ".blog",
];

type WhitelistEntry = {
  pattern: string;
  tier: SourceTier;
  sourceType: SourceType;
  sourceName: string;
};

const WHITELIST: WhitelistEntry[] = [
  { pattern: "fifa.com", tier: "official", sourceType: "Official FIFA Hospitality", sourceName: "FIFA" },
  { pattern: "hospitality.fifa", tier: "official", sourceType: "Official FIFA Hospitality", sourceName: "FIFA Hospitality" },
  { pattern: "onlocation", tier: "official", sourceType: "Official On Location", sourceName: "On Location" },
  { pattern: "metlife", tier: "official", sourceType: "Official Venue", sourceName: "MetLife Stadium" },
  { pattern: "sofi", tier: "official", sourceType: "Official Venue", sourceName: "SoFi Stadium" },
  { pattern: "attstadium", tier: "official", sourceType: "Official Venue", sourceName: "AT&T Stadium" },
  { pattern: "gillette", tier: "official", sourceType: "Official Venue", sourceName: "Gillette Stadium" },
  { pattern: "hardrockstadium", tier: "official", sourceType: "Official Venue", sourceName: "Hard Rock Stadium" },
  { pattern: "levisstadium", tier: "official", sourceType: "Official Venue", sourceName: "Levi's Stadium" },
  { pattern: "lumenfield", tier: "official", sourceType: "Official Venue", sourceName: "Lumen Field" },
  { pattern: "nrgpark", tier: "official", sourceType: "Official Venue", sourceName: "NRG Park" },
  { pattern: "bcplace", tier: "official", sourceType: "Official Venue", sourceName: "BC Place" },
  { pattern: "bmofield", tier: "official", sourceType: "Official Venue", sourceName: "BMO Field" },
  { pattern: "estadioazteca", tier: "official", sourceType: "Official Venue", sourceName: "Estadio Azteca" },
  { pattern: "ticketmaster", tier: "premium", sourceType: "Premium Ticket Provider", sourceName: "Ticketmaster" },
  { pattern: "stubhub", tier: "premium", sourceType: "Premium Ticket Provider", sourceName: "StubHub" },
  { pattern: "viagogo", tier: "premium", sourceType: "Premium Ticket Provider", sourceName: "Viagogo" },
  { pattern: "seatgeek", tier: "premium", sourceType: "Premium Ticket Provider", sourceName: "SeatGeek" },
  { pattern: "tickpick", tier: "premium", sourceType: "Premium Ticket Provider", sourceName: "TickPick" },
  { pattern: "marriott", tier: "hospitality", sourceType: "Hospitality Company", sourceName: "Marriott" },
  { pattern: "hilton", tier: "hospitality", sourceType: "Hospitality Company", sourceName: "Hilton" },
  { pattern: "hyatt", tier: "hospitality", sourceType: "Hospitality Company", sourceName: "Hyatt" },
  { pattern: "accor", tier: "hospitality", sourceType: "Hospitality Company", sourceName: "Accor" },
  { pattern: "fourseasons", tier: "hospitality", sourceType: "Hospitality Company", sourceName: "Four Seasons" },
  { pattern: "expedia", tier: "hospitality", sourceType: "Travel Partner", sourceName: "Expedia" },
  { pattern: "booking.com", tier: "hospitality", sourceType: "Travel Partner", sourceName: "Booking.com" },
  { pattern: "miamidolphins", tier: "official", sourceType: "Official Venue", sourceName: "Hard Rock Stadium" },
  { pattern: "newyorkjets", tier: "official", sourceType: "Official Venue", sourceName: "MetLife Stadium" },
  { pattern: "newyorkgiants", tier: "official", sourceType: "Official Venue", sourceName: "MetLife Stadium" },
  { pattern: "patriots", tier: "official", sourceType: "Official Venue", sourceName: "Gillette Stadium" },
  { pattern: "atlantafalcons", tier: "official", sourceType: "Official Venue", sourceName: "Mercedes-Benz Stadium" },
  { pattern: "dallascowboys", tier: "official", sourceType: "Official Venue", sourceName: "AT&T Stadium" },
  { pattern: "chiefs", tier: "official", sourceType: "Official Venue", sourceName: "Arrowhead Stadium" },
  { pattern: "49ers", tier: "official", sourceType: "Official Venue", sourceName: "Levi's Stadium" },
  { pattern: "seahawks", tier: "official", sourceType: "Official Venue", sourceName: "Lumen Field" },
  { pattern: "mercedesbenzstadium", tier: "official", sourceType: "Official Venue", sourceName: "Mercedes-Benz Stadium" },
  { pattern: "roadtrips", tier: "hospitality", sourceType: "Travel Partner", sourceName: "Roadtrips" },
  { pattern: "sportstraveler", tier: "hospitality", sourceType: "Travel Partner", sourceName: "Sports Traveler" },
];

export const WHITELIST_DOMAINS = [
  "fifa.com",
  "fifaworldcup26.hospitality.fifa.com",
  "hospitality.fifa.com",
  "onlocationexp.com",
  "onlocation.com",
  "metlifestadium.com",
  "sofiestadium.com",
  "attstadium.com",
  "gilletteestadium.com",
  "hardrockstadium.com",
  "levisstadium.com",
  "lumenfield.com",
  "nrgpark.com",
  "bcplace.com",
  "bmo.com",
  "ticketmaster.com",
  "stubhub.com",
  "viagogo.com",
  "seatgeek.com",
  "tickpick.com",
  "marriott.com",
  "hilton.com",
  "hyatt.com",
  "accor.com",
  "fourseasons.com",
  "expedia.com",
  "booking.com",
  "miamidolphins.com",
  "newyorkjets.com",
  "newyorkgiants.com",
  "patriots.com",
  "atlantafalcons.com",
  "dallascowboys.com",
  "chiefs.com",
  "49ers.com",
  "seahawks.com",
  "mercedesbenzstadium.com",
  "roadtrips.com",
  "sportstraveler.net",
  "sofistadium.com",
];

export const BLACKLIST_DOMAINS = [
  "reddit.com",
  "quora.com",
  "twitter.com",
  "x.com",
  "facebook.com",
  "instagram.com",
  "tiktok.com",
  "youtube.com",
  "medium.com",
  "blogspot.com",
  "wordpress.com",
  "substack.com",
  "pinterest.com",
  "linkedin.com",
  "wikipedia.org",
];

function parseHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

export function isBlacklistedSource(url: string): boolean {
  const host = parseHostname(url);
  if (!host) return true;

  if (BLACKLIST_HOST_PATTERNS.some((pattern) => host === pattern || host.endsWith(`.${pattern}`))) {
    return true;
  }

  return BLACKLIST_HOST_SUBSTRINGS.some((substring) => host.includes(substring));
}

export function classifySource(url: string): SourceClassification | null {
  if (isBlacklistedSource(url)) {
    return null;
  }

  const host = parseHostname(url);
  if (!host) return null;

  const match = WHITELIST.find((entry) => host.includes(entry.pattern));
  if (!match) {
    return null;
  }

  return {
    allowed: true,
    tier: match.tier,
    sourceType: match.sourceType,
    sourceName: match.sourceName,
    isOfficial: match.tier === "official",
  };
}

export function officialSourceScoreBoost(tier: SourceTier): number {
  switch (tier) {
    case "official":
      return 40;
    case "premium":
      return 35;
    case "hospitality":
      return 30;
  }
}
