import { createHash } from "crypto";
import type { AccessRecord } from "@/lib/opportunities/types";

type StarterEntry = {
  matchName: string;
  matchStage: AccessRecord["matchStage"];
  city: string;
  venue: string;
  eventDate: string;
  accessType: AccessRecord["accessType"];
  hospitalityCategory: AccessRecord["hospitalityCategory"];
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

  return {
    id,
    slug,
    groupKey,
    matchName: entry.matchName,
    matchStage: entry.matchStage,
    city: entry.city,
    venue: entry.venue,
    eventDate: entry.eventDate,
    accessType: entry.accessType,
    hospitalityCategory: entry.hospitalityCategory,
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
  };
}

const STARTER_ENTRIES: StarterEntry[] = [
  {
    matchName: "FIFA Official Hospitality Packages",
    matchStage: "Unknown",
    city: "Unknown",
    venue: "Unknown",
    eventDate: "June–July 2026",
    accessType: "Hospitality Package",
    hospitalityCategory: "FIFA Hospitality",
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
    matchStage: "Unknown",
    city: "Unknown",
    venue: "Unknown",
    eventDate: "June–July 2026",
    accessType: "Travel Package",
    hospitalityCategory: "Travel Partner",
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
    city: "East Rutherford, NJ",
    venue: "MetLife Stadium",
    eventDate: "July 2026",
    accessType: "Hospitality Package",
    hospitalityCategory: "Official Venue",
    sourceName: "MetLife Stadium",
    sourceType: "Official Venue",
    sourceUrl: "https://www.metlifestadium.com/events-tickets/fifa-world-cup-26",
    summary:
      "Official venue hospitality for matches at MetLife Stadium, including the World Cup Final. NYC metro access hub.",
    availability: "Inquiry Required",
    actionLabel: "View venue hospitality",
  },
  {
    matchName: "SoFi Stadium Hospitality",
    matchStage: "Unknown",
    city: "Los Angeles",
    venue: "SoFi Stadium",
    eventDate: "June–July 2026",
    accessType: "Hospitality Package",
    hospitalityCategory: "Official Venue",
    sourceName: "SoFi Stadium",
    sourceType: "Official Venue",
    sourceUrl: "https://www.sofistadium.com/events",
    summary: "Official LA host-city hospitality and premium seating pathways for SoFi Stadium matches.",
    availability: "Inquiry Required",
    actionLabel: "View SoFi hospitality",
  },
  {
    matchName: "Hard Rock Stadium Hospitality",
    matchStage: "Unknown",
    city: "Miami",
    venue: "Hard Rock Stadium",
    eventDate: "June–July 2026",
    accessType: "Hospitality Package",
    hospitalityCategory: "Official Venue",
    sourceName: "Hard Rock Stadium",
    sourceType: "Official Venue",
    sourceUrl: "https://www.hardrockstadium.com/events",
    summary: "Miami host-city hospitality and premium access for matches at Hard Rock Stadium.",
    availability: "Inquiry Required",
    actionLabel: "View venue hospitality",
  },
  {
    matchName: "AT&T Stadium Hospitality",
    matchStage: "Unknown",
    city: "Dallas",
    venue: "AT&T Stadium",
    eventDate: "June–July 2026",
    accessType: "Hospitality Package",
    hospitalityCategory: "Official Venue",
    sourceName: "AT&T Stadium",
    sourceType: "Official Venue",
    sourceUrl: "https://attstadium.com/events",
    summary: "Dallas host-city official hospitality and premium inventory at AT&T Stadium.",
    availability: "Inquiry Required",
    actionLabel: "View venue hospitality",
  },
  {
    matchName: "NRG Stadium Hospitality",
    matchStage: "Unknown",
    city: "Houston",
    venue: "NRG Stadium",
    eventDate: "June–July 2026",
    accessType: "Hospitality Package",
    hospitalityCategory: "Official Venue",
    sourceName: "NRG Park",
    sourceType: "Official Venue",
    sourceUrl: "https://www.nrgpark.com/events",
    summary: "Houston host-city hospitality pathways for NRG Stadium World Cup matches.",
    availability: "Inquiry Required",
    actionLabel: "View venue hospitality",
  },
  {
    matchName: "Gillette Stadium Hospitality",
    matchStage: "Unknown",
    city: "Boston",
    venue: "Gillette Stadium",
    eventDate: "June–July 2026",
    accessType: "Hospitality Package",
    hospitalityCategory: "Official Venue",
    sourceName: "Gillette Stadium",
    sourceType: "Official Venue",
    sourceUrl: "https://www.gillette-stadium.com/events",
    summary: "Boston-area host hospitality for matches at Gillette Stadium.",
    availability: "Inquiry Required",
    actionLabel: "View venue hospitality",
  },
  {
    matchName: "Lincoln Financial Field Hospitality",
    matchStage: "Unknown",
    city: "Philadelphia",
    venue: "Lincoln Financial Field",
    eventDate: "June–July 2026",
    accessType: "Hospitality Package",
    hospitalityCategory: "Official Venue",
    sourceName: "Lincoln Financial Field",
    sourceType: "Official Venue",
    sourceUrl: "https://www.lincolnfinancialfield.com/events",
    summary: "Philadelphia host-city hospitality for World Cup matches at Lincoln Financial Field.",
    availability: "Inquiry Required",
    actionLabel: "View venue hospitality",
  },
  {
    matchName: "Levi's Stadium Hospitality",
    matchStage: "Unknown",
    city: "San Francisco",
    venue: "Levi's Stadium",
    eventDate: "June–July 2026",
    accessType: "Hospitality Package",
    hospitalityCategory: "Official Venue",
    sourceName: "Levi's Stadium",
    sourceType: "Official Venue",
    sourceUrl: "https://www.levisstadium.com/events",
    summary: "Bay Area host hospitality for matches at Levi's Stadium.",
    availability: "Inquiry Required",
    actionLabel: "View venue hospitality",
  },
  {
    matchName: "Lumen Field Hospitality",
    matchStage: "Unknown",
    city: "Seattle",
    venue: "Lumen Field",
    eventDate: "June–July 2026",
    accessType: "Hospitality Package",
    hospitalityCategory: "Official Venue",
    sourceName: "Lumen Field",
    sourceType: "Official Venue",
    sourceUrl: "https://www.lumenfield.com/events",
    summary: "Seattle host-city hospitality for World Cup matches at Lumen Field.",
    availability: "Inquiry Required",
    actionLabel: "View venue hospitality",
  },
  {
    matchName: "NYC Metro Hotels — World Cup Stays",
    matchStage: "Unknown",
    city: "New York / NJ",
    venue: "Unknown",
    eventDate: "June–July 2026",
    accessType: "Travel Package",
    hospitalityCategory: "Travel Partner",
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
  const byUrl = new Map<string, AccessRecord>();

  for (const record of starter) {
    byUrl.set(record.sourceUrl, record);
  }
  for (const record of records) {
    byUrl.set(record.sourceUrl, record);
  }

  return Array.from(byUrl.values());
}
