import { createHash } from "crypto";
import { cleanScrapedSummary } from "@/lib/opportunities/clean-summary";
import {
  classifyMatchStageFromText,
  classifyMatchStageMultiPass,
  extractCoreFields,
  buildExtractionPasses,
  type ExtractionInput,
} from "@/lib/opportunities/extraction";
import {
  findVenueInText,
  inferCityFromVenue,
} from "@/lib/opportunities/extraction/geo";
import {
  buildStructuredTitle,
  computeConfidenceScore,
  sanitizePageTitle,
} from "@/lib/opportunities/quality";
import { applyOfficialInference } from "@/lib/opportunities/infer-official";
import { classifySource } from "@/lib/opportunities/sources";
import type {
  AccessRecord,
  AccessType,
  Availability,
  HospitalityCategory,
  MatchStage,
} from "@/lib/opportunities/types";

export type TavilyResult = {
  title: string;
  url: string;
  content: string;
  score?: number;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

function createId(url: string): string {
  return createHash("sha256").update(url).digest("hex").slice(0, 12);
}

function firstPassMatch<T>(
  input: ExtractionInput,
  finder: (text: string) => T | null
): T | null {
  const passes = buildExtractionPasses(input);
  for (const pass of passes) {
    if (!pass.text) continue;
    const value = finder(pass.text);
    if (value) return value;
  }
  return null;
}

export function classifyMatchStage(text: string): MatchStage {
  return classifyMatchStageFromText(text);
}

export function classifyAccessType(text: string): AccessType {
  const t = text.toLowerCase();

  if (t.includes("shared suite")) return "Shared Suite";
  if (t.includes("private suite") || /\bsuite\b/.test(t)) return "Suite";
  if (t.includes("club seat") || t.includes("club level")) return "Club Seat";
  if (t.includes("lounge") || t.includes("club lounge")) return "Lounge";
  if (t.includes("travel package") || t.includes("hotel package")) {
    return "Travel Package";
  }
  if (t.includes("vip experience") || t.includes("vip package")) {
    return "VIP Experience";
  }
  if (t.includes("private event") || t.includes("corporate event")) {
    return "Private Event";
  }
  if (t.includes("hospitality package") || t.includes("hospitality")) {
    return "Hospitality Package";
  }

  return "Unknown";
}

function classifyAccessTypeMultiPass(input: ExtractionInput): AccessType {
  const passes = buildExtractionPasses(input);
  for (const pass of passes) {
    const type = classifyAccessType(pass.text);
    if (type !== "Unknown") return type;
  }
  return "Unknown";
}

function extractPrices(text: string): {
  priceMin: number | null;
  priceMax: number | null;
  currency: string;
} {
  const rangeMatch = text.match(
    /\$\s*([\d,]+(?:\.\d{2})?)\s*(?:–|-|to)\s*\$\s*([\d,]+(?:\.\d{2})?)/i
  );
  if (rangeMatch) {
    const min = Number(rangeMatch[1].replace(/,/g, ""));
    const max = Number(rangeMatch[2].replace(/,/g, ""));
    if (min > 0 && max > 0) {
      return {
        priceMin: Math.min(min, max),
        priceMax: Math.max(min, max),
        currency: "USD",
      };
    }
  }

  const amounts = [...text.matchAll(/\$\s*([\d,]+(?:\.\d{2})?)/g)]
    .map((m) => Number(m[1].replace(/,/g, "")))
    .filter((n) => n >= 100);

  if (!amounts.length) {
    return { priceMin: null, priceMax: null, currency: "USD" };
  }

  return {
    priceMin: Math.min(...amounts),
    priceMax: Math.max(...amounts),
    currency: "USD",
  };
}

function extractPricesMultiPass(input: ExtractionInput): {
  priceMin: number | null;
  priceMax: number | null;
  currency: string;
} {
  const passes = buildExtractionPasses(input);
  for (const pass of passes) {
    const prices = extractPrices(pass.text);
    if (prices.priceMin !== null || prices.priceMax !== null) {
      return prices;
    }
  }
  return { priceMin: null, priceMax: null, currency: "USD" };
}

function extractCapacity(text: string): string {
  const seatMatch = text.match(/\b(\d{1,4})\s*(seats?|guests?|people|pax)\b/i);
  if (seatMatch) {
    const unit = seatMatch[2].toLowerCase().startsWith("seat") ? "Seats" : "Guests";
    return `${seatMatch[1]} ${unit}`;
  }
  return "Unknown";
}

function extractCapacityMultiPass(input: ExtractionInput): string {
  const result = firstPassMatch(input, (text) => {
    const cap = extractCapacity(text);
    return cap !== "Unknown" ? cap : null;
  });
  return result ?? "Unknown";
}

function extractAvailability(text: string): Availability {
  const t = text.toLowerCase();
  if (t.includes("sold out")) return "Waitlist";
  if (t.includes("waitlist") || t.includes("wait list")) return "Waitlist";
  if (t.includes("limited availability") || t.includes("limited seats")) {
    return "Limited";
  }
  if (
    t.includes("inquiry") ||
    t.includes("request pricing") ||
    t.includes("contact for price")
  ) {
    return "Inquiry Required";
  }
  if (t.includes("available") || t.includes("buy now") || t.includes("book now")) {
    return "Available";
  }
  return "Unknown";
}

function extractAvailabilityMultiPass(input: ExtractionInput): Availability {
  const passes = buildExtractionPasses(input);
  for (const pass of passes) {
    const availability = extractAvailability(pass.text);
    if (availability !== "Unknown") return availability;
  }
  return "Unknown";
}

function mapHospitalityCategory(
  sourceType: AccessRecord["sourceType"]
): HospitalityCategory {
  switch (sourceType) {
    case "Official FIFA Hospitality":
    case "Official FIFA":
    case "Official On Location":
    case "Official Hospitality Provider":
    case "Hospitality Company":
      return "FIFA Hospitality";
    case "Official Venue":
    case "Official Partner":
      return "Official Venue";
    case "Premium Ticket Provider":
      return "Broker / Reseller";
    case "Travel Partner":
      return "Travel Partner";
    default:
      return "Unknown";
  }
}

export function buildGroupKey(
  matchName: string,
  venue: string,
  eventDate: string
): string {
  if (matchName === "Unknown" || venue === "Unknown" || matchName.length < 5) {
    return "";
  }

  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return `${normalize(matchName)}|${normalize(venue)}|${normalize(eventDate)}`;
}

export function extractAccessRecord(
  result: TavilyResult,
  lastUpdated: string
): { record: AccessRecord; rawSummary: string } | null {
  const source = classifySource(result.url);
  if (!source) {
    return null;
  }

  const input: ExtractionInput = {
    url: result.url,
    title: result.title,
    content: result.content,
  };

  const core = extractCoreFields(input);
  let city = core.city;
  let venue = core.venue;
  const { eventDate, matchStage } = core;

  if (venue === "Unknown") {
    const fromSource = findVenueInText(source.sourceName);
    if (fromSource) {
      venue = fromSource;
      if (city === "Unknown") {
        const inferred = inferCityFromVenue(venue);
        if (inferred) city = inferred;
      }
    }
  }

  const accessType = classifyAccessTypeMultiPass(input);
  const { priceMin, priceMax, currency } = extractPricesMultiPass(input);
  const capacity = extractCapacityMultiPass(input);
  const availability = extractAvailabilityMultiPass(input);

  const resolvedStage =
    matchStage !== "Unknown"
      ? matchStage
      : classifyMatchStageMultiPass(buildExtractionPasses(input));

  const matchName =
    buildStructuredTitle(resolvedStage, accessType, city, venue) ?? "Unknown";

  const confidenceScore = computeConfidenceScore(
    { city, venue, eventDate, priceMin, priceMax, capacity },
    source.tier
  );

  const id = createId(result.url);
  const slug = `${slugify(matchName !== "Unknown" ? matchName : sanitizePageTitle(result.title))}-${id}`;
  const groupKey = buildGroupKey(matchName, venue, eventDate) || `record-${id}`;

  const rawSummary = result.content.trim();
  const cleanedSummary = cleanScrapedSummary(rawSummary, matchName);

  const record: AccessRecord = applyOfficialInference({
    id,
    slug,
    groupKey,
    matchName,
    matchStage: resolvedStage,
    city,
    venue,
    eventDate,
    accessType,
    hospitalityCategory: mapHospitalityCategory(source.sourceType),
    capacity,
    priceMin,
    priceMax,
    currency,
    availability,
    sourceName: source.sourceName,
    sourceType: source.sourceType,
    sourceUrl: result.url,
    lastUpdated,
    summary: cleanedSummary,
    confidenceScore,
  });

  return { record, rawSummary };
}
