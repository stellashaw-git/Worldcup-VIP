/** Keywords that signal inventory / package pages rather than news articles. */
export const PACKAGE_LISTING_KEYWORDS = [
  "price",
  "suite",
  "hospitality",
  "premium seating",
  "executive suite",
  "vip package",
  "inventory",
  "availability",
] as const;

export type SiteSearchQuery = {
  domain: string;
  query: string;
};

/**
 * Site-targeted searches for structured hospitality inventory — not broad articles.
 * Each query is scoped to a single domain via Tavily include_domains.
 */
export const SITE_SEARCH_QUERIES: SiteSearchQuery[] = [
  {
    domain: "fifa.com",
    query:
      "hospitality packages suite vip inventory availability price world cup 2026",
  },
  {
    domain: "onlocationexp.com",
    query:
      "world cup hospitality suite premium seating executive suite vip package inventory",
  },
  {
    domain: "metlifestadium.com",
    query:
      "suite hospitality premium seating executive suite vip package availability price",
  },
  {
    domain: "sofiestadium.com",
    query:
      "premium seating suite hospitality executive suite vip package inventory availability",
  },
  {
    domain: "hardrockstadium.com",
    query:
      "hospitality suite premium seating executive suite vip package price availability",
  },
  {
    domain: "mercedesbenzstadium.com",
    query:
      "suites hospitality premium seating executive suite vip package inventory",
  },
  {
    domain: "ticketmaster.com",
    query:
      "premium hospitality suite vip package executive suite availability price world cup",
  },
  {
    domain: "roadtrips.com",
    query:
      "world cup packages hospitality suite premium seating vip inventory availability price",
  },
  {
    domain: "sportstraveler.net",
    query:
      "world cup hospitality packages suite premium seating vip inventory availability",
  },
];

/** Alternate domains searched alongside primary venue domains. */
export const SITE_SEARCH_ALIASES: SiteSearchQuery[] = [
  {
    domain: "hospitality.fifa.com",
    query:
      "hospitality packages suite vip inventory availability price world cup 2026",
  },
  {
    domain: "sofistadium.com",
    query:
      "premium seating suite hospitality executive suite vip package inventory",
  },
];

export const ALL_SITE_SEARCH_QUERIES: SiteSearchQuery[] = [
  ...SITE_SEARCH_QUERIES,
  ...SITE_SEARCH_ALIASES,
];
