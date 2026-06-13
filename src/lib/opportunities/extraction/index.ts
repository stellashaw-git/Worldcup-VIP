import { findDateInText } from "@/lib/opportunities/extraction/dates";
import {
  findCityInText,
  findVenueInText,
  inferCityFromVenue,
  inferVenueFromUrl,
} from "@/lib/opportunities/extraction/geo";
import type { MatchStage } from "@/lib/opportunities/types";

export type ExtractionInput = {
  url: string;
  title: string;
  content: string;
};

export type ExtractionPass = {
  id: "metadata" | "title" | "description" | "content" | "patterns";
  text: string;
};

export type ExtractedLocation = {
  city: string;
  venue: string;
};

export type ExtractedFields = {
  city: string;
  venue: string;
  eventDate: string;
  matchStage: MatchStage;
};

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/** Pull labeled fields from scraped snippets (Location:, Venue:, Stadium:, etc.). */
function extractStructuredMetadata(content: string): string {
  const labels =
    /(?:host\s+city|host\s+location|location|city|venue|stadium|arena|host)\s*[:\-–]\s*([^\n|•]{2,80})/gi;
  const parts: string[] = [];
  for (const match of content.matchAll(labels)) {
    parts.push(match[0]);
    if (match[1]) parts.push(match[1]);
  }
  return parts.join(" ");
}

function extractDescription(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) return "";

  const metaDesc = trimmed.match(
    /(?:description|summary|about)[:\s]+([^\n]{20,300})/i
  );
  if (metaDesc?.[1]) {
    return normalizeWhitespace(metaDesc[1]);
  }

  const firstBlock = trimmed.split(/\n{2,}|\.(?:\s|$)/)[0] ?? trimmed;
  return normalizeWhitespace(firstBlock).slice(0, 400);
}

export function buildExtractionPasses(input: ExtractionInput): ExtractionPass[] {
  const metadata = extractStructuredMetadata(input.content);
  const description = extractDescription(input.content);
  const urlHint = inferVenueFromUrl(input.url) ?? "";

  return [
    {
      id: "metadata",
      text: normalizeWhitespace(
        `${urlHint} ${metadata} ${inferVenueFromUrl(input.url) ?? ""}`
      ),
    },
    { id: "title", text: normalizeWhitespace(input.title) },
    { id: "description", text: description },
    { id: "content", text: normalizeWhitespace(input.content) },
    {
      id: "patterns",
      text: normalizeWhitespace(
        `${input.title} ${description} ${input.content} ${input.url}`
      ),
    },
  ];
}

function firstMatchAcrossPasses<T>(
  passes: ExtractionPass[],
  finder: (text: string) => T | null
): T | null {
  for (const pass of passes) {
    if (!pass.text) continue;
    const value = finder(pass.text);
    if (value) return value;
  }
  return null;
}

export function extractVenueMultiPass(
  passes: ExtractionPass[],
  url: string
): string {
  const fromPasses = firstMatchAcrossPasses(passes, findVenueInText);
  if (fromPasses) return fromPasses;

  const fromUrl = inferVenueFromUrl(url);
  if (fromUrl) return fromUrl;

  return "Unknown";
}

export function extractCityMultiPass(
  passes: ExtractionPass[],
  venue: string
): string {
  const fromPasses = firstMatchAcrossPasses(passes, findCityInText);
  if (fromPasses) return fromPasses;

  if (venue !== "Unknown") {
    const inferred = inferCityFromVenue(venue);
    if (inferred) return inferred;
  }

  return "Unknown";
}

export function extractDateMultiPass(passes: ExtractionPass[]): string {
  const fromPasses = firstMatchAcrossPasses(passes, findDateInText);
  return fromPasses ?? "Unknown";
}

export function classifyMatchStageMultiPass(
  passes: ExtractionPass[]
): MatchStage {
  for (const pass of passes) {
    const stage = classifyMatchStageFromText(pass.text);
    if (stage !== "Unknown") return stage;
  }
  return "Unknown";
}

export function classifyMatchStageFromText(text: string): MatchStage {
  const t = text.toLowerCase();

  if (t.includes("third place")) return "Third Place Match";
  if (t.includes("opening match") || t.includes("opening ceremony")) {
    return "Opening Match";
  }
  if (t.includes("semi-final") || t.includes("semi final")) return "Semi Final";
  if (t.includes("quarter-final") || t.includes("quarter final")) {
    return "Quarter Final";
  }
  if (t.includes("round of 16")) return "Round of 16";
  if (t.includes("round of 32")) return "Round of 32";
  if (t.includes("group stage")) return "Group Stage";
  if (
    t.includes("world cup 2026") ||
    t.includes("fifa world cup") ||
    t.includes("world cup hospitality")
  ) {
    return "Group Stage";
  }
  if (
    /\bworld cup final\b/i.test(text) ||
    (/\bfinal\b/i.test(text) && !t.includes("semi") && !t.includes("quarter"))
  ) {
    return "Final";
  }

  return "Unknown";
}

export function extractLocationFields(input: ExtractionInput): ExtractedLocation {
  const passes = buildExtractionPasses(input);
  const venue = extractVenueMultiPass(passes, input.url);
  const city = extractCityMultiPass(passes, venue);

  return { city, venue };
}

export function extractCoreFields(input: ExtractionInput): ExtractedFields {
  const passes = buildExtractionPasses(input);
  const venue = extractVenueMultiPass(passes, input.url);
  const city = extractCityMultiPass(passes, venue);
  const eventDate = extractDateMultiPass(passes);
  const matchStage = classifyMatchStageMultiPass(passes);

  return { city, venue, eventDate, matchStage };
}
