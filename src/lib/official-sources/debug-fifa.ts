import { parseListingBlock } from "@/lib/official-sources/parse-listing-text";
import { collectMatchCardTextsScript } from "@/lib/official-sources/collect-match-cards";
import {
  FIFA_CHOOSE_MATCHES_URL,
  type OfficialListing,
} from "@/lib/official-sources/types";
import {
  ensurePlaywrightBrowsersPath,
  formatPlaywrightInstallHint,
  isMissingPlaywrightBrowserError,
  launchChromium,
} from "@/lib/official-sources/playwright-launch";
import {
  EXTRACTION_TIMEOUT_MS,
  withTimeout,
} from "@/lib/official-sources/timeout";

const PAGE_TIMEOUT_MS = 45_000;
const DEFAULT_LIMIT = 10;

ensurePlaywrightBrowsersPath();

const PARSE_DEFAULTS = {
  sourceName: "FIFA Hospitality",
  sourceType: "Official FIFA Hospitality" as const,
  sourceUrl: FIFA_CHOOSE_MATCHES_URL,
};

export type DebugCardResult = {
  index: number;
  rawText: string;
  parsed: OfficialListing | null;
  displayLines: string[];
  rejectReason?: string;
};

export type DebugFifaExtractionResult = {
  ok: boolean;
  url: string;
  error?: string;
  errorStack?: string;
  pageTitle?: string;
  bodyTextLength?: number;
  durationMs?: number;
  totalCardsFound: number;
  totalCardsParsed: number;
  totalCardsRejected: number;
  cards: DebugCardResult[];
  limitedTo: number;
};

function formatDisplayLines(parsed: OfficialListing): string[] {
  const lines: string[] = [parsed.matchName];

  if (parsed.matchStageDetail) {
    lines.push(parsed.matchStageDetail);
  } else if (parsed.matchStage !== "Unknown") {
    lines.push(parsed.matchStage);
  }

  if (parsed.eventDate !== "Unknown") {
    lines.push(parsed.eventDate.replace(/, 2026$/, ""));
  }

  if (parsed.kickoffTime) {
    lines.push(parsed.kickoffTime);
  }

  if (parsed.hostCity !== "Unknown") {
    lines.push(parsed.hostCity);
  }

  if (parsed.venue !== "Unknown") {
    lines.push(parsed.venue);
  }

  if (parsed.priceMin !== null) {
    lines.push(
      `Starting at $${parsed.priceMin.toLocaleString()} ${parsed.currency}`
    );
  }

  return lines;
}

function dedupeCardTexts(texts: string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const text of texts) {
    const normalized = text.replace(/\s+/g, " ").trim();
    if (normalized.length < 12) continue;
    if (!/\bvs\b/i.test(normalized)) continue;
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    unique.push(text.trim());
  }

  return unique;
}

async function runDebugExtraction(
  limit: number
): Promise<DebugFifaExtractionResult> {
  const start = Date.now();
  const browser = await launchChromium();

  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });

    console.info("[BLACKBOOK] Debug: launching browser, navigating to FIFA...");

    await page.goto(FIFA_CHOOSE_MATCHES_URL, {
      waitUntil: "domcontentloaded",
      timeout: PAGE_TIMEOUT_MS,
    });

    await page.waitForTimeout(3000);

    try {
      await page.waitForSelector("text=/vs/i", { timeout: 10000 });
    } catch {
      console.warn("[BLACKBOOK] Debug: no vs selector within 10s, parsing body");
    }

    console.info("[BLACKBOOK] Debug: collecting match cards from DOM...");

    const { cards: rawCards, pageTitle, bodyLength } = await page.evaluate(
      collectMatchCardTextsScript
    );

    const uniqueCards = dedupeCardTexts(rawCards);
    const totalCardsFound = uniqueCards.length;
    const selectedCards = uniqueCards.slice(0, limit);

    const cards: DebugCardResult[] = [];
    let totalCardsParsed = 0;
    let totalCardsRejected = 0;

    for (let i = 0; i < selectedCards.length; i += 1) {
      const rawText = selectedCards[i];
      const parsed = parseListingBlock(rawText, PARSE_DEFAULTS);

      if (parsed) {
        totalCardsParsed += 1;
        cards.push({
          index: i + 1,
          rawText,
          parsed,
          displayLines: formatDisplayLines(parsed),
        });
      } else {
        totalCardsRejected += 1;
        let rejectReason = "Parser could not extract a match listing";
        if (!/\bvs\b/i.test(rawText)) {
          rejectReason = "No team vs team pattern found in card text";
        }

        cards.push({
          index: i + 1,
          rawText,
          parsed: null,
          displayLines: [],
          rejectReason,
        });
      }
    }

    const durationMs = Date.now() - start;
    console.info(
      `[BLACKBOOK] Debug: done in ${durationMs}ms — found ${totalCardsFound}, parsed ${totalCardsParsed}`
    );

    return {
      ok: true,
      url: FIFA_CHOOSE_MATCHES_URL,
      pageTitle,
      bodyTextLength: bodyLength,
      durationMs,
      totalCardsFound,
      totalCardsParsed,
      totalCardsRejected,
      cards,
      limitedTo: limit,
    };
  } finally {
    await browser.close();
  }
}

export async function debugFifaExtraction(
  limit = DEFAULT_LIMIT
): Promise<DebugFifaExtractionResult> {
  const empty: DebugFifaExtractionResult = {
    ok: false,
    url: FIFA_CHOOSE_MATCHES_URL,
    totalCardsFound: 0,
    totalCardsParsed: 0,
    totalCardsRejected: 0,
    cards: [],
    limitedTo: limit,
  };

  try {
    return await withTimeout(
      runDebugExtraction(limit),
      EXTRACTION_TIMEOUT_MS,
      "FIFA debug extraction"
    );
  } catch (error) {
    const message = isMissingPlaywrightBrowserError(error)
      ? formatPlaywrightInstallHint()
      : error instanceof Error
        ? error.message
        : "Unknown Playwright error";
    const stack =
      error instanceof Error && !isMissingPlaywrightBrowserError(error)
        ? error.stack
        : undefined;

    console.error("[BLACKBOOK] Debug extraction failed:", message);

    return {
      ...empty,
      error: message,
      errorStack: stack,
    };
  }
}
