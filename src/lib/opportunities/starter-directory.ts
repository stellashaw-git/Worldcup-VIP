import { createHash } from "crypto";
import { applyOfficialInference } from "@/lib/opportunities/infer-official";
import type { AccessRecord, ListingKind } from "@/lib/opportunities/types";

type StarterEntry = {
  matchName: string;
  matchStage: AccessRecord["matchStage"];
  matchStageDetail?: string;
  city: string;
  venue: string;
  eventDate: string;
  accessType: AccessRecord["accessType"];
  hospitalityCategory: AccessRecord["hospitalityCategory"];
  listingKind: ListingKind;
  productName?: string;
  sourceName: string;
  sourceType: AccessRecord["sourceType"];
  sourceUrl: string;
  summary: string;
  availability: AccessRecord["availability"];
  actionLabel?: string;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

function createId(sourceUrl: string, matchName: string): string {
  return createHash("sha256")
    .update(`${sourceUrl}|${matchName}`)
    .digest("hex")
    .slice(0, 12);
}

function entryToRecord(entry: StarterEntry, lastUpdated: string): AccessRecord {
  const id = createId(entry.sourceUrl, entry.matchName);
  const slug = `${slugify(entry.matchName)}-${id}`;
  const groupKey = `${entry.matchName}|${entry.venue}|${entry.eventDate}`;

  return applyOfficialInference({
    id,
    slug,
    groupKey,
    matchName: entry.matchName,
    matchStage: entry.matchStage,
    matchStageDetail: entry.matchStageDetail,
    city: entry.city,
    venue: entry.venue,
    eventDate: entry.eventDate,
    accessType: entry.accessType,
    hospitalityCategory: entry.hospitalityCategory,
    productName: entry.productName,
    listingKind: entry.listingKind,
    capacity: "Unknown",
    priceMin: null,
    priceMax: null,
    currency: "USD",
    availability: entry.availability,
    sourceName: entry.sourceName,
    sourceType: entry.sourceType,
    sourceUrl: entry.sourceUrl,
    lastUpdated,
    summary: entry.summary,
    confidenceScore: 90,
    actionLabel: entry.actionLabel,
  });
}

const STARTER_ENTRIES: StarterEntry[] = [
  {
    matchName: "FIFA Official Hospitality Packages",
    matchStage: "Group Stage",
    matchStageDetail: "Official FIFA Hub",
    city: "Unknown",
    venue: "Unknown",
    eventDate: "June–July 2026",
    accessType: "Hospitality Package",
    hospitalityCategory: "FIFA Hospitality",
    listingKind: "official_hub",
    sourceName: "FIFA",
    sourceType: "Official FIFA Hospitality",
    sourceUrl: "https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicoandusa2026/hospitality",
    summary:
      "Official FIFA hospitality hub for World Cup 2026. Compare match-linked packages, lounges, and premium inventory from the rights holder.",
    availability: "Inquiry Required",
    actionLabel: "View FIFA hospitality",
  },
  {
    matchName: "On Location Official Packages",
    matchStage: "Group Stage",
    matchStageDetail: "Official Travel Partner",
    city: "Unknown",
    venue: "Unknown",
    eventDate: "June–July 2026",
    accessType: "Travel Package",
    hospitalityCategory: "Travel Partner",
    listingKind: "official_hub",
    sourceName: "On Location",
    sourceType: "Official On Location",
    sourceUrl: "https://www.onlocationexp.com/fifa-world-cup-2026",
    summary:
      "Official hospitality and travel packages from On Location. Starting point for suites, lounges, and multi-match bundles.",
    availability: "Inquiry Required",
    actionLabel: "View On Location packages",
  },
  {
    matchName: "MetLife Stadium Hospitality",
    matchStage: "Final",
    matchStageDetail: "World Cup Final Venue",
    city: "East Rutherford, NJ",
    venue: "MetLife Stadium",
    eventDate: "July 2026",
    accessType: "Hospitality Package",
    hospitalityCategory: "Official Venue",
    listingKind: "venue_portal",
    sourceName: "MetLife Stadium",
    sourceType: "Official Venue",
    sourceUrl: "https://www.metlifestadium.com/events-tickets/fifa-world-cup-26",
    summary:
      "Official venue hospitality for matches at MetLife Stadium, including the World Cup Final. NYC metro access hub.",
    availability: "Inquiry Required",
    actionLabel: "View venue hospitality",
  },
  {
    matchName: "Champions Club — World Cup Final",
    matchStage: "Final",
    matchStageDetail: "World Cup Final Venue",
    city: "East Rutherford, NJ",
    venue: "MetLife Stadium",
    eventDate: "July 2026",
    accessType: "Club Seat",
    hospitalityCategory: "Official Venue",
    listingKind: "hospitality_product",
    productName: "Champions Club",
    sourceName: "MetLife Stadium",
    sourceType: "Official Venue",
    sourceUrl: "https://www.metlifestadium.com/events-tickets/fifa-world-cup-26",
    summary:
      "Premium club-level hospitality for the World Cup Final at MetLife Stadium. Elevated dining, lounge access, and the most coveted seats in the building.",
    availability: "Limited",
    actionLabel: "Request Champions Club access",
  },
  {
    matchName: "SoFi Stadium Hospitality",
    matchStage: "Group Stage",
    matchStageDetail: "Host City Venue",
    city: "Los Angeles",
    venue: "SoFi Stadium",
    eventDate: "June–July 2026",
    accessType: "Hospitality Package",
    hospitalityCategory: "Official Venue",
    listingKind: "venue_portal",
    sourceName: "SoFi Stadium",
    sourceType: "Official Venue",
    sourceUrl: "https://www.sofistadium.com/events",
    summary: "Official LA host-city hospitality and premium seating pathways for SoFi Stadium matches.",
    availability: "Inquiry Required",
    actionLabel: "View SoFi hospitality",
  },
  {
    matchName: "Hard Rock Stadium Hospitality",
    matchStage: "Group Stage",
    matchStageDetail: "Host City Venue",
    city: "Miami",
    venue: "Hard Rock Stadium",
    eventDate: "June–July 2026",
    accessType: "Hospitality Package",
    hospitalityCategory: "Official Venue",
    listingKind: "venue_portal",
    sourceName: "Hard Rock Stadium",
    sourceType: "Official Venue",
    sourceUrl: "https://www.hardrockstadium.com/events",
    summary: "Miami host-city hospitality and premium access for matches at Hard Rock Stadium.",
    availability: "Inquiry Required",
    actionLabel: "View venue hospitality",
  },
  {
    matchName: "Pitchside Lounge — Hard Rock Stadium",
    matchStage: "Group Stage",
    matchStageDetail: "Host City Venue",
    city: "Miami",
    venue: "Hard Rock Stadium",
    eventDate: "June–July 2026",
    accessType: "Lounge",
    hospitalityCategory: "Official Venue",
    listingKind: "hospitality_product",
    productName: "Pitchside Lounge",
    sourceName: "Hard Rock Stadium",
    sourceType: "Official Venue",
    sourceUrl: "https://www.hardrockstadium.com/events",
    summary:
      "Pitchside lounge hospitality at Hard Rock Stadium — premium lounge access steps from the action in Miami.",
    availability: "Limited",
    actionLabel: "Request Pitchside Lounge access",
  },
  {
    matchName: "AT&T Stadium Hospitality",
    matchStage: "Group Stage",
    matchStageDetail: "Host City Venue",
    city: "Dallas",
    venue: "AT&T Stadium",
    eventDate: "June–July 2026",
    accessType: "Hospitality Package",
    hospitalityCategory: "Official Venue",
    listingKind: "venue_portal",
    sourceName: "AT&T Stadium",
    sourceType: "Official Venue",
    sourceUrl: "https://attstadium.com/events",
    summary: "Dallas host-city official hospitality and premium inventory at AT&T Stadium.",
    availability: "Inquiry Required",
    actionLabel: "View venue hospitality",
  },
  {
    matchName: "NRG Stadium Hospitality",
    matchStage: "Group Stage",
    matchStageDetail: "Host City Venue",
    city: "Houston",
    venue: "NRG Stadium",
    eventDate: "June–July 2026",
    accessType: "Hospitality Package",
    hospitalityCategory: "Official Venue",
    listingKind: "venue_portal",
    sourceName: "NRG Park",
    sourceType: "Official Venue",
    sourceUrl: "https://www.nrgpark.com/events",
    summary: "Houston host-city hospitality pathways for NRG Stadium World Cup matches.",
    availability: "Inquiry Required",
    actionLabel: "View venue hospitality",
  },
  {
    matchName: "Gillette Stadium Hospitality",
    matchStage: "Group Stage",
    matchStageDetail: "Host City Venue",
    city: "Boston",
    venue: "Gillette Stadium",
    eventDate: "June–July 2026",
    accessType: "Hospitality Package",
    hospitalityCategory: "Official Venue",
    listingKind: "venue_portal",
    sourceName: "Gillette Stadium",
    sourceType: "Official Venue",
    sourceUrl: "https://www.gillette-stadium.com/events",
    summary: "Boston-area host hospitality for matches at Gillette Stadium.",
    availability: "Inquiry Required",
    actionLabel: "View venue hospitality",
  },
  {
    matchName: "Lincoln Financial Field Hospitality",
    matchStage: "Group Stage",
    matchStageDetail: "Host City Venue",
    city: "Philadelphia",
    venue: "Lincoln Financial Field",
    eventDate: "June–July 2026",
    accessType: "Hospitality Package",
    hospitalityCategory: "Official Venue",
    listingKind: "venue_portal",
    sourceName: "Lincoln Financial Field",
    sourceType: "Official Venue",
    sourceUrl: "https://www.lincolnfinancialfield.com/events",
    summary: "Philadelphia host-city hospitality for World Cup matches at Lincoln Financial Field.",
    availability: "Inquiry Required",
    actionLabel: "View venue hospitality",
  },
  {
    matchName: "Levi's Stadium Hospitality",
    matchStage: "Group Stage",
    matchStageDetail: "Host City Venue",
    city: "San Francisco",
    venue: "Levi's Stadium",
    eventDate: "June–July 2026",
    accessType: "Hospitality Package",
    hospitalityCategory: "Official Venue",
    listingKind: "venue_portal",
    sourceName: "Levi's Stadium",
    sourceType: "Official Venue",
    sourceUrl: "https://www.levisstadium.com/events",
    summary: "Bay Area host hospitality for matches at Levi's Stadium.",
    availability: "Inquiry Required",
    actionLabel: "View venue hospitality",
  },
  {
    matchName: "Lumen Field Hospitality",
    matchStage: "Group Stage",
    matchStageDetail: "Host City Venue",
    city: "Seattle",
    venue: "Lumen Field",
    eventDate: "June–July 2026",
    accessType: "Hospitality Package",
    hospitalityCategory: "Official Venue",
    listingKind: "venue_portal",
    sourceName: "Lumen Field",
    sourceType: "Official Venue",
    sourceUrl: "https://www.lumenfield.com/events",
    summary: "Seattle host-city hospitality for World Cup matches at Lumen Field.",
    availability: "Inquiry Required",
    actionLabel: "View venue hospitality",
  },
  {
    matchName: "NYC Metro Hotels — World Cup Stays",
    matchStage: "Group Stage",
    matchStageDetail: "Hotel & Stays",
    city: "New York / NJ",
    venue: "Unknown",
    eventDate: "June–July 2026",
    accessType: "Travel Package",
    hospitalityCategory: "Travel Partner",
    listingKind: "travel_bundle",
    sourceName: "Marriott",
    sourceType: "Hospitality Company",
    sourceUrl: "https://www.marriott.com",
    summary:
      "Starting point for NYC metro hotel inventory during the tournament. Use for group inquiries and official brand WC landing pages as they publish.",
    availability: "Inquiry Required",
    actionLabel: "Explore hotel options",
  },
];

export function getStarterDirectoryRecords(): AccessRecord[] {
  const lastUpdated = new Date().toISOString();
  return STARTER_ENTRIES.map((entry) => entryToRecord(entry, lastUpdated));
}

export function mergeStarterRecords(records: AccessRecord[]): AccessRecord[] {
  const starter = getStarterDirectoryRecords();
  const byKey = new Map<string, AccessRecord>();

  function recordKey(record: AccessRecord): string {
    return `${record.sourceUrl}|${record.matchName}`;
  }

  for (const record of starter) {
    byKey.set(recordKey(record), record);
  }
  for (const record of records) {
    byKey.set(recordKey(record), applyOfficialInference(record));
  }

  return Array.from(byKey.values());
}
