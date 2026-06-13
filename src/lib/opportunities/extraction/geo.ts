/** Canonical host cities for World Cup 2026 — longer phrases matched first. */
export const HOST_CITY_ALIASES: Array<{ pattern: string; city: string }> = [
  { pattern: "new york city", city: "New York" },
  { pattern: "new york/new jersey", city: "New York / New Jersey" },
  { pattern: "new york / new jersey", city: "New York / New Jersey" },
  { pattern: "new york", city: "New York" },
  { pattern: "new jersey", city: "New Jersey" },
  { pattern: "mexico city", city: "Mexico City" },
  { pattern: "kansas city", city: "Kansas City" },
  { pattern: "los angeles", city: "Los Angeles" },
  { pattern: "san francisco", city: "San Francisco" },
  { pattern: "east rutherford", city: "East Rutherford" },
  { pattern: "santa clara", city: "Santa Clara" },
  { pattern: "foxborough", city: "Foxborough" },
  { pattern: "guadalajara", city: "Guadalajara" },
  { pattern: "monterrey", city: "Monterrey" },
  { pattern: "inglewood", city: "Inglewood" },
  { pattern: "arlington", city: "Arlington" },
  { pattern: "atlanta", city: "Atlanta" },
  { pattern: "boston", city: "Boston" },
  { pattern: "dallas", city: "Dallas" },
  { pattern: "houston", city: "Houston" },
  { pattern: "miami", city: "Miami" },
  { pattern: "philadelphia", city: "Philadelphia" },
  { pattern: "seattle", city: "Seattle" },
  { pattern: "toronto", city: "Toronto" },
  { pattern: "vancouver", city: "Vancouver" },
];

export type VenueEntry = {
  canonical: string;
  aliases: string[];
};

export const WORLD_CUP_VENUES: VenueEntry[] = [
  {
    canonical: "MetLife Stadium",
    aliases: ["metlife stadium", "metlife", "met life stadium"],
  },
  {
    canonical: "SoFi Stadium",
    aliases: ["sofi stadium", "sofi", "so fi stadium"],
  },
  {
    canonical: "AT&T Stadium",
    aliases: ["at&t stadium", "att stadium", "cowboys stadium"],
  },
  {
    canonical: "Mercedes-Benz Stadium",
    aliases: [
      "mercedes-benz stadium",
      "mercedes benz stadium",
      "mercedesbenz stadium",
    ],
  },
  {
    canonical: "Hard Rock Stadium",
    aliases: ["hard rock stadium", "hardrock stadium"],
  },
  {
    canonical: "Gillette Stadium",
    aliases: ["gillette stadium"],
  },
  {
    canonical: "Levi's Stadium",
    aliases: ["levi's stadium", "levis stadium", "levi stadium"],
  },
  {
    canonical: "Lincoln Financial Field",
    aliases: ["lincoln financial field", "lincoln financial"],
  },
  {
    canonical: "Lumen Field",
    aliases: ["lumen field", "seahawks stadium"],
  },
  {
    canonical: "Arrowhead Stadium",
    aliases: ["arrowhead stadium"],
  },
  {
    canonical: "Estadio Azteca",
    aliases: ["estadio azteca", "azteca stadium"],
  },
  {
    canonical: "BC Place",
    aliases: ["bc place"],
  },
  {
    canonical: "BMO Field",
    aliases: ["bmo field"],
  },
  {
    canonical: "NRG Stadium",
    aliases: ["nrg stadium", "nrg park"],
  },
  {
    canonical: "Rose Bowl",
    aliases: ["rose bowl"],
  },
];

export const VENUE_TO_CITY: Record<string, string> = {
  "MetLife Stadium": "New York / New Jersey",
  "SoFi Stadium": "Los Angeles",
  "Hard Rock Stadium": "Miami",
  "AT&T Stadium": "Dallas",
  "Mercedes-Benz Stadium": "Atlanta",
  "Gillette Stadium": "Foxborough",
  "Levi's Stadium": "Santa Clara",
  "Lumen Field": "Seattle",
  "NRG Stadium": "Houston",
  "Arrowhead Stadium": "Kansas City",
  "BC Place": "Vancouver",
  "BMO Field": "Toronto",
  "Estadio Azteca": "Mexico City",
  "Lincoln Financial Field": "Philadelphia",
  "Rose Bowl": "Los Angeles",
};

/** Infer venue from URL hostname or path segments. */
export const URL_VENUE_HINTS: Array<{ pattern: string; venue: string }> = [
  { pattern: "metlife", venue: "MetLife Stadium" },
  { pattern: "sofi", venue: "SoFi Stadium" },
  { pattern: "attstadium", venue: "AT&T Stadium" },
  { pattern: "mercedesbenz", venue: "Mercedes-Benz Stadium" },
  { pattern: "hardrock", venue: "Hard Rock Stadium" },
  { pattern: "gillette", venue: "Gillette Stadium" },
  { pattern: "levis", venue: "Levi's Stadium" },
  { pattern: "lincolnfinancial", venue: "Lincoln Financial Field" },
  { pattern: "lumenfield", venue: "Lumen Field" },
  { pattern: "arrowhead", venue: "Arrowhead Stadium" },
  { pattern: "estadioazteca", venue: "Estadio Azteca" },
  { pattern: "bcplace", venue: "BC Place" },
  { pattern: "bmofield", venue: "BMO Field" },
  { pattern: "nrgpark", venue: "NRG Stadium" },
  { pattern: "nrg stadium", venue: "NRG Stadium" },
];

export function findCityInText(text: string): string | null {
  const lower = text.toLowerCase();
  for (const { pattern, city } of HOST_CITY_ALIASES) {
    const regex = new RegExp(`\\b${escapeRegex(pattern)}\\b`, "i");
    if (regex.test(lower)) {
      return city;
    }
  }
  return null;
}

export function findVenueInText(text: string): string | null {
  const lower = text.toLowerCase();
  for (const entry of WORLD_CUP_VENUES) {
    for (const alias of entry.aliases) {
      if (lower.includes(alias)) {
        return entry.canonical;
      }
    }
    if (lower.includes(entry.canonical.toLowerCase())) {
      return entry.canonical;
    }
  }
  return null;
}

export function inferVenueFromUrl(url: string): string | null {
  const lower = url.toLowerCase();
  for (const { pattern, venue } of URL_VENUE_HINTS) {
    if (lower.includes(pattern)) {
      return venue;
    }
  }
  return null;
}

export function inferCityFromVenue(venue: string): string | null {
  return VENUE_TO_CITY[venue] ?? null;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
