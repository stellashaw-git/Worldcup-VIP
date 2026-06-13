import type { AccessRecord } from "@/lib/opportunities/types";
import { inferListingKind } from "@/lib/opportunities/listing-kind";

export type HostCityCatalogEntry = {
  slug: string;
  label: string;
  headline: string;
  hook: string;
  matchCities: string[];
  featured?: boolean;
};

export type VenueCatalogEntry = {
  slug: string;
  name: string;
  citySlug: string;
  hook?: string;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export const HOST_CITY_CATALOG: HostCityCatalogEntry[] = [
  {
    slug: "new-york-nj",
    label: "New York / NJ",
    headline: "New York Metro",
    hook: "Final host city — MetLife and the wider metro",
    matchCities: [
      "New York / NJ",
      "East Rutherford",
      "New York",
      "New Jersey",
      "New York / New Jersey",
    ],
    featured: true,
  },
  {
    slug: "miami",
    label: "Miami",
    headline: "Miami",
    hook: "Hard Rock Stadium and South Florida's World Cup scene",
    matchCities: ["Miami"],
    featured: true,
  },
  {
    slug: "los-angeles",
    label: "Los Angeles",
    headline: "Los Angeles",
    hook: "Hollywood meets the world’s game at SoFi Stadium",
    matchCities: ["Los Angeles", "Inglewood"],
  },
  {
    slug: "dallas",
    label: "Dallas",
    headline: "Dallas",
    hook: "Big-stage energy at AT&T Stadium",
    matchCities: ["Dallas", "Arlington"],
  },
  {
    slug: "houston",
    label: "Houston",
    headline: "Houston",
    hook: "NRG Stadium and Houston's host-city offerings",
    matchCities: ["Houston"],
  },
  {
    slug: "boston",
    label: "Boston",
    headline: "Boston",
    hook: "Gillette Stadium — New England’s World Cup moment",
    matchCities: ["Boston", "Foxborough"],
  },
  {
    slug: "philadelphia",
    label: "Philadelphia",
    headline: "Philadelphia",
    hook: "Lincoln Financial Field and Philadelphia's match calendar",
    matchCities: ["Philadelphia"],
  },
  {
    slug: "san-francisco",
    label: "San Francisco",
    headline: "Bay Area",
    hook: "Levi’s Stadium — Silicon Valley’s World Cup host",
    matchCities: ["San Francisco", "Santa Clara"],
  },
  {
    slug: "seattle",
    label: "Seattle",
    headline: "Seattle",
    hook: "Lumen Field — Pacific Northwest hospitality",
    matchCities: ["Seattle"],
  },
];

export const VENUE_CATALOG: VenueCatalogEntry[] = [
  {
    slug: "metlife-stadium",
    name: "MetLife Stadium",
    citySlug: "new-york-nj",
    hook: "Hosts the World Cup Final",
  },
  {
    slug: "hard-rock-stadium",
    name: "Hard Rock Stadium",
    citySlug: "miami",
  },
  {
    slug: "sofi-stadium",
    name: "SoFi Stadium",
    citySlug: "los-angeles",
  },
  {
    slug: "att-stadium",
    name: "AT&T Stadium",
    citySlug: "dallas",
  },
  {
    slug: "nrg-stadium",
    name: "NRG Stadium",
    citySlug: "houston",
  },
  {
    slug: "gillette-stadium",
    name: "Gillette Stadium",
    citySlug: "boston",
  },
  {
    slug: "lincoln-financial-field",
    name: "Lincoln Financial Field",
    citySlug: "philadelphia",
  },
  {
    slug: "levis-stadium",
    name: "Levi's Stadium",
    citySlug: "san-francisco",
  },
  {
    slug: "lumen-field",
    name: "Lumen Field",
    citySlug: "seattle",
  },
];

export function getCityBySlug(slug: string): HostCityCatalogEntry | undefined {
  return HOST_CITY_CATALOG.find((city) => city.slug === slug);
}

export function getVenueBySlug(slug: string): VenueCatalogEntry | undefined {
  return VENUE_CATALOG.find((venue) => venue.slug === slug);
}

export function resolveCitySlug(city: string): string | null {
  if (!city || city === "Unknown") return null;
  const normalized = city.trim().toLowerCase();
  for (const entry of HOST_CITY_CATALOG) {
    if (
      entry.matchCities.some(
        (match) => match.toLowerCase() === normalized
      )
    ) {
      return entry.slug;
    }
  }
  return slugify(city);
}

export function resolveVenueSlug(venue: string): string | null {
  if (!venue || venue === "Unknown") return null;
  const catalog = VENUE_CATALOG.find((entry) => entry.name === venue);
  if (catalog) return catalog.slug;
  return slugify(venue);
}

function recordMatchesCity(record: AccessRecord, citySlug: string): boolean {
  const catalog = getCityBySlug(citySlug);
  if (!catalog) return false;

  const recordCity = record.city.trim().toLowerCase();
  if (recordCity === "unknown") return false;

  return catalog.matchCities.some(
    (match) => match.toLowerCase() === recordCity
  );
}

export function getRecordsForCity(
  records: AccessRecord[],
  citySlug: string
): AccessRecord[] {
  return records.filter((record) => recordMatchesCity(record, citySlug));
}

export function getRecordsForVenue(
  records: AccessRecord[],
  venueSlug: string
): AccessRecord[] {
  const venue = getVenueBySlug(venueSlug);
  if (!venue) return [];

  return records.filter(
    (record) => record.venue === venue.name || resolveVenueSlug(record.venue) === venueSlug
  );
}

export function getVenuesForCity(
  records: AccessRecord[],
  citySlug: string
): VenueCatalogEntry[] {
  const cityRecords = getRecordsForCity(records, citySlug);
  const venueNames = new Set(
    cityRecords
      .map((record) => record.venue)
      .filter((venue) => venue !== "Unknown")
  );

  const fromCatalog = VENUE_CATALOG.filter(
    (venue) => venue.citySlug === citySlug && venueNames.has(venue.name)
  );

  if (fromCatalog.length > 0) return fromCatalog;

  return Array.from(venueNames).map((name) => ({
    slug: resolveVenueSlug(name) ?? slugify(name),
    name,
    citySlug,
  }));
}

export function getOfficialHubs(records: AccessRecord[]): AccessRecord[] {
  return records.filter(
    (record) => inferListingKind(record) === "official_hub"
  );
}

export function getVenuePortal(
  records: AccessRecord[],
  venueSlug: string
): AccessRecord | undefined {
  return getRecordsForVenue(records, venueSlug).find(
    (record) => inferListingKind(record) === "venue_portal"
  );
}

export function getHospitalityProducts(
  records: AccessRecord[],
  venueSlug: string
): AccessRecord[] {
  return getRecordsForVenue(records, venueSlug).filter(
    (record) => inferListingKind(record) === "hospitality_product"
  );
}

export function getTravelBundlesForCity(
  records: AccessRecord[],
  citySlug: string
): AccessRecord[] {
  return getRecordsForCity(records, citySlug).filter(
    (record) => inferListingKind(record) === "travel_bundle"
  );
}

export function countCityListings(
  records: AccessRecord[],
  citySlug: string
): number {
  return getRecordsForCity(records, citySlug).length;
}

export function countVenueListings(
  records: AccessRecord[],
  venueSlug: string
): number {
  return getRecordsForVenue(records, venueSlug).length;
}
