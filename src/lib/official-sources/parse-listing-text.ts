import type { AccessType, Availability } from "@/lib/opportunities/types";
import type { OfficialListing } from "@/lib/official-sources/types";

const VS_PATTERN = /\b([A-Za-z][A-Za-z\s'.-]+?)\s+vs\.?\s+([A-Za-z][A-Za-z\s'.-]+)\b/i;
const GROUP_PATTERN = /^Group\s+([A-Z]|\d+)/i;
const STAGE_PATTERNS: Array<{ pattern: RegExp; stage: string }> = [
  { pattern: /\bworld cup final\b/i, stage: "Final" },
  { pattern: /\bsemi[- ]?final\b/i, stage: "Semi Final" },
  { pattern: /\bquarter[- ]?final\b/i, stage: "Quarter Final" },
  { pattern: /\bround of 16\b/i, stage: "Round of 16" },
  { pattern: /\bround of 32\b/i, stage: "Round of 32" },
  { pattern: /\bopening match\b/i, stage: "Opening Match" },
  { pattern: /\bthird place\b/i, stage: "Third Place Match" },
  { pattern: /^group\s+/i, stage: "Group Stage" },
];

function classifyAccessFromText(text: string): AccessType {
  const t = text.toLowerCase();
  if (t.includes("executive suite") || /\bsuite\b/.test(t)) return "Suite";
  if (t.includes("lounge")) return "Lounge";
  if (t.includes("vip")) return "VIP Experience";
  if (t.includes("hospitality")) return "Hospitality Package";
  return "Hospitality Package";
}

function parseAvailability(text: string): Availability {
  const t = text.toLowerCase();
  if (t.includes("sold out")) return "Waitlist";
  if (t.includes("limited")) return "Limited";
  if (t.includes("inquiry")) return "Inquiry Required";
  if (t.includes("available")) return "Available";
  return "Available";
}

function parsePrice(text: string): {
  priceMin: number | null;
  priceMax: number | null;
  currency: string;
} {
  const starting = text.match(
    /(?:starting at|from|starts at)\s*\$?\s*([\d,]+(?:\.\d{2})?)\s*(USD|CAD|EUR)?/i
  );
  if (starting) {
    const amount = Number(starting[1].replace(/,/g, ""));
    const currency = starting[2]?.toUpperCase() ?? "USD";
    return { priceMin: amount, priceMax: amount, currency };
  }

  const range = text.match(
    /\$\s*([\d,]+)\s*(?:–|-|to)\s*\$\s*([\d,]+)/i
  );
  if (range) {
    const min = Number(range[1].replace(/,/g, ""));
    const max = Number(range[2].replace(/,/g, ""));
    return { priceMin: min, priceMax: max, currency: "USD" };
  }

  const single = text.match(/\$\s*([\d,]+(?:\.\d{2})?)/);
  if (single) {
    const amount = Number(single[1].replace(/,/g, ""));
    if (amount >= 100) {
      return { priceMin: amount, priceMax: amount, currency: "USD" };
    }
  }

  return { priceMin: null, priceMax: null, currency: "USD" };
}

function parseEventDate(line: string): string | null {
  const long = line.match(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:,?\s+2026)?/i
  );
  if (long) {
    return `${long[1]} ${long[2]}, 2026`;
  }

  const short = line.match(
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2})(?:,?\s+2026)?/i
  );
  if (short) {
    return `${short[0].replace(/\s+2026/i, "")}, 2026`;
  }

  return null;
}

function parseKickoff(line: string): string | undefined {
  const match = line.match(
    /\b(\d{1,2}:\d{2}\s*(?:am|pm)(?:\s+[A-Z]{2,3})?)/i
  );
  return match?.[1];
}

function parseVenueLine(line: string): string | null {
  if (/stadium|field|arena|bowl|azteca|place/i.test(line) && !/vs/i.test(line)) {
    return line.replace(/\s*,\s*United States$/i, "").trim();
  }
  return null;
}

function parseHostCity(line: string): string | null {
  if (/united states|canada|mexico/i.test(line) && !/stadium/i.test(line)) {
    return line.replace(/,?\s*United States$/i, "").trim();
  }
  const cityMatch = line.match(
    /^([A-Za-z\s'.-]+),\s*(?:United States|USA|Canada|Mexico)/i
  );
  if (cityMatch) return cityMatch[1].trim();
  return null;
}

function parseStageLine(line: string): {
  matchStage: string;
  matchStageDetail?: string;
} {
  for (const { pattern, stage } of STAGE_PATTERNS) {
    if (pattern.test(line)) {
      const group = line.match(GROUP_PATTERN);
      return {
        matchStage: stage,
        matchStageDetail: group ? group[0] : undefined,
      };
    }
  }
  const groupOnly = line.match(GROUP_PATTERN);
  if (groupOnly) {
    return { matchStage: "Group Stage", matchStageDetail: groupOnly[0] };
  }
  return { matchStage: "Unknown" };
}

function splitIntoBlocks(text: string): string[] {
  const normalized = text.replace(/\r\n/g, "\n");
  const indices: number[] = [];

  const vsRegex = /\n([A-Za-z][^\n]{2,60}\s+vs\.?\s+[A-Za-z][^\n]{2,60})\n/gi;
  let match;
  while ((match = vsRegex.exec(normalized)) !== null) {
    indices.push(match.index + 1);
  }

  if (indices.length === 0) {
    const inline = [...normalized.matchAll(/\b([A-Za-z][A-Za-z\s'.-]{2,30}\s+vs\.?\s+[A-Za-z][A-Za-z\s'.-]{2,30})\b/gi)];
    if (inline.length === 0) return [normalized];
    return inline.map((m) => {
      const start = m.index ?? 0;
      return normalized.slice(start, start + 600);
    });
  }

  const blocks: string[] = [];
  for (let i = 0; i < indices.length; i += 1) {
    const start = indices[i];
    const end = indices[i + 1] ?? normalized.length;
    blocks.push(normalized.slice(start, end).trim());
  }
  return blocks;
}

export function parseListingBlock(
  block: string,
  defaults: Pick<
    OfficialListing,
    "sourceName" | "sourceType" | "sourceUrl"
  >
): OfficialListing | null {
  const lines = block
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (!lines.length) return null;

  const vsLine =
    lines.find((l) => VS_PATTERN.test(l)) ??
    lines.find((l) => /\bvs\b/i.test(l));
  if (!vsLine) return null;

  const vsMatch = vsLine.match(VS_PATTERN);
  if (!vsMatch) return null;

  const matchName = `${vsMatch[1].trim()} vs ${vsMatch[2].trim()}`;
  const teams = matchName;

  let matchStage = "Unknown";
  let matchStageDetail: string | undefined;
  let eventDate = "Unknown";
  let kickoffTime: string | undefined;
  let hostCity = "Unknown";
  let venue = "Unknown";

  for (const line of lines) {
    if (GROUP_PATTERN.test(line) || STAGE_PATTERNS.some((s) => s.pattern.test(line))) {
      const stage = parseStageLine(line);
      matchStage = stage.matchStage;
      matchStageDetail = stage.matchStageDetail;
    }

    const date = parseEventDate(line);
    if (date) eventDate = date;

    const kickoff = parseKickoff(line);
    if (kickoff) kickoffTime = kickoff;

    const city = parseHostCity(line);
    if (city) hostCity = city;

    const venueLine = parseVenueLine(line);
    if (venueLine) venue = venueLine;
  }

  const blockText = block;
  const { priceMin, priceMax, currency } = parsePrice(blockText);
  const accessType = classifyAccessFromText(blockText);
  const availability = parseAvailability(blockText);

  const productMatch = blockText.match(
    /(?:hospitality product|package|product)[:\s]+([^\n]{4,60})/i
  );

  return {
    matchName,
    teams,
    matchStage,
    matchStageDetail,
    eventDate,
    kickoffTime,
    hostCity,
    venue,
    accessType,
    hospitalityProduct: accessType,
    productName: productMatch?.[1]?.trim(),
    priceMin,
    priceMax,
    currency,
    availability,
    sourceName: defaults.sourceName,
    sourceType: defaults.sourceType,
    sourceUrl: defaults.sourceUrl,
  };
}

export function parseOfficialListingText(
  text: string,
  defaults: Pick<
    OfficialListing,
    "sourceName" | "sourceType" | "sourceUrl"
  >
): OfficialListing[] {
  const blocks = splitIntoBlocks(text);
  const listings: OfficialListing[] = [];
  const seen = new Set<string>();

  for (const block of blocks) {
    const listing = parseListingBlock(block, defaults);
    if (!listing) continue;
    const key = `${listing.matchName}|${listing.eventDate}|${listing.venue}`;
    if (seen.has(key)) continue;
    seen.add(key);
    listings.push(listing);
  }

  return listings;
}
