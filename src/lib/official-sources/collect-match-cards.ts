/** Shared DOM card collection — avoids scanning every div (hangs on large SPAs). */

const CARD_SELECTORS = [
  "[class*='match-card']",
  "[class*='MatchCard']",
  "[class*='match_card']",
  "[data-testid*='match']",
  "[class*='match']",
  "[class*='Match']",
  "article",
  "[class*='card']",
  "[class*='Card']",
  "main",
];

const MAX_ELEMENTS_PER_SELECTOR = 80;

export function collectMatchCardTextsScript(): {
  cards: string[];
  pageTitle: string;
  bodyLength: number;
} {
  const candidates: string[] = [];

  const pushIfMatch = (text: string | undefined | null) => {
    if (!text) return;
    const trimmed = text.trim();
    if (trimmed.length < 12 || trimmed.length > 1200) return;
    if (!/\bvs\b/i.test(trimmed)) return;
    candidates.push(trimmed);
  };

  for (const selector of CARD_SELECTORS) {
    const elements = document.querySelectorAll(selector);
    const limit = Math.min(elements.length, MAX_ELEMENTS_PER_SELECTOR);
    for (let i = 0; i < limit; i += 1) {
      pushIfMatch((elements[i] as HTMLElement).innerText);
    }
  }

  const body = document.body?.innerText?.trim() ?? "";

  if (candidates.length < 5 && body.length > 0) {
    const blocks = body.split(/\n{2,}/);
    for (const block of blocks) {
      if (block.length > 12 && block.length < 1200 && /\bvs\b/i.test(block)) {
        candidates.push(block.trim());
      }
    }
  }

  const leafCards: string[] = [];
  for (const text of candidates) {
    const isParentOfSmaller = candidates.some(
      (other) =>
        other !== text &&
        other.length < text.length &&
        text.includes(other) &&
        other.length > 20
    );
    if (!isParentOfSmaller) {
      leafCards.push(text);
    }
  }

  const unique = [...new Set(leafCards.length ? leafCards : candidates)];

  return {
    cards: unique,
    pageTitle: document.title ?? "",
    bodyLength: body.length,
  };
}
