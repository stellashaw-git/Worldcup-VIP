export const PICK_CATEGORIES = [
  { id: "watch-party", label: "Best Watch Party" },
  { id: "founder", label: "Best Founder Event" },
  { id: "investor", label: "Best Investor Gathering" },
  { id: "hospitality", label: "Best Hospitality Experience" },
  { id: "brand", label: "Best Brand Activation" },
] as const;

export type PickCategoryId = (typeof PICK_CATEGORIES)[number]["id"];

/** A verified pick — only add entries with real source, organizer, date, and link. */
export type CuratedPick = {
  id: string;
  title: string;
  date: string;
  description: string;
  categoryId: PickCategoryId;
  organizer: string;
  sourceUrl: string;
  sourceName?: string;
};

/**
 * Manually curated NYC picks with verified sources.
 * Leave empty until real events are collected — UI shows category placeholders.
 */
export const NYC_CURATED_PICKS: CuratedPick[] = [];

export function getCategoryLabel(categoryId: PickCategoryId): string {
  return PICK_CATEGORIES.find((c) => c.id === categoryId)?.label ?? "Pick";
}

export function getPickForCategory(
  categoryId: PickCategoryId
): CuratedPick | undefined {
  return NYC_CURATED_PICKS.find((pick) => pick.categoryId === categoryId);
}

export function isVerifiedPick(pick: CuratedPick): boolean {
  return (
    pick.title.trim().length > 0 &&
    pick.organizer.trim().length > 0 &&
    pick.date.trim().length > 0 &&
    pick.sourceUrl.trim().length > 0
  );
}

export function getPickById(id: string): CuratedPick | undefined {
  return NYC_CURATED_PICKS.find((pick) => pick.id === id);
}
