import type { TavilyResult } from "@/lib/opportunities/extract";
import { PACKAGE_LISTING_KEYWORDS } from "@/lib/tavily/search-config";

const ARTICLE_TITLE_PATTERNS = [
  /\bnews\b/i,
  /\bblog\b/i,
  /\barticle\b/i,
  /\beditorial\b/i,
  /\bpreview\b/i,
  /\broundup\b/i,
  /\brecap\b/i,
  /\banalysis\b/i,
  /\bopinion\b/i,
  /\binterview\b/i,
  /\bbreaking\b/i,
  /everything you need to know/i,
  /what to know/i,
  /guide to/i,
  /how to get/i,
  /tickets on sale/i,
  /draw results/i,
  /match schedule/i,
  /group standings/i,
];

const ARTICLE_URL_PATTERNS = [
  /\/news\//i,
  /\/blog\//i,
  /\/article\//i,
  /\/press\//i,
  /\/media\//i,
  /\/story\//i,
  /\/stories\//i,
];

const MIN_PACKAGE_SCORE = 2;

function combinedText(result: TavilyResult): string {
  return `${result.title} ${result.content}`.toLowerCase();
}

export function packageListingScore(result: TavilyResult): number {
  const text = combinedText(result);
  let score = 0;

  for (const keyword of PACKAGE_LISTING_KEYWORDS) {
    if (text.includes(keyword.toLowerCase())) {
      score += 2;
    }
  }

  if (/\$\s*[\d,]+/.test(text)) {
    score += 3;
  }

  if (
    /\b(book now|buy now|request pricing|inquire|inventory|packages?)\b/i.test(
      text
    )
  ) {
    score += 2;
  }

  if (typeof result.score === "number") {
    score += Math.min(result.score, 1);
  }

  return score;
}

export function isLikelyArticlePage(result: TavilyResult): boolean {
  const title = result.title;
  const url = result.url;
  const text = combinedText(result);

  const hasPackageSignal = PACKAGE_LISTING_KEYWORDS.some((keyword) =>
    text.includes(keyword.toLowerCase())
  );

  if (hasPackageSignal && packageListingScore(result) >= MIN_PACKAGE_SCORE + 2) {
    return false;
  }

  if (ARTICLE_URL_PATTERNS.some((pattern) => pattern.test(url))) {
    return true;
  }

  if (ARTICLE_TITLE_PATTERNS.some((pattern) => pattern.test(title))) {
    return true;
  }

  return !hasPackageSignal;
}

export function filterAndRankPackageListings(results: TavilyResult[]): {
  results: TavilyResult[];
  discardedArticles: number;
} {
  let discardedArticles = 0;

  const ranked = results
    .map((result) => ({
      result,
      score: packageListingScore(result),
    }))
    .filter(({ result, score }) => {
      if (score < MIN_PACKAGE_SCORE) {
        discardedArticles += 1;
        return false;
      }

      if (isLikelyArticlePage(result) && score < MIN_PACKAGE_SCORE + 3) {
        discardedArticles += 1;
        return false;
      }

      return true;
    })
    .sort((a, b) => b.score - a.score);

  return {
    results: ranked.map(({ result }) => result),
    discardedArticles,
  };
}
