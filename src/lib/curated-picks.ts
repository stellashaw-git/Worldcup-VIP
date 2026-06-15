export const EDITOR_CATEGORIES = [
  { id: "watch", label: "Watch experience" },
  { id: "private", label: "Private viewing" },
  { id: "social", label: "Social gathering" },
  { id: "brand", label: "Brand experience" },
  { id: "hospitality", label: "Hospitality experience" },
] as const;

export type EditorCategoryId = (typeof EDITOR_CATEGORIES)[number]["id"];

export type CuratedPick = {
  id: string;
  title: string;
  date: string;
  description: string;
  categoryId: EditorCategoryId;
};

/** Manually curated NYC picks — update editorial copy as the season unfolds. */
export const NYC_CURATED_PICKS: CuratedPick[] = [
  {
    id: "nyc-watch-hudson",
    title: "Hudson Yards private viewing",
    date: "June 14, 2026",
    categoryId: "watch",
    description:
      "An intimate room with a strong crowd — people stay through the final whistle.",
  },
  {
    id: "nyc-rooftop-opening",
    title: "Rooftop opening weekend screening",
    date: "June 12, 2026",
    categoryId: "watch",
    description:
      "Skyline views and a social first half — atmosphere without the stadium crush.",
  },
  {
    id: "nyc-lounge-viewing",
    title: "Midtown lounge viewing salon",
    date: "June 21, 2026",
    categoryId: "private",
    description:
      "A quiet, invite-only room with reserved seating and a considered guest list.",
  },
  {
    id: "nyc-supper-club",
    title: "Supper club match night",
    date: "June 28, 2026",
    categoryId: "social",
    description:
      "Dinner, match, conversation — a classic New York evening.",
  },
  {
    id: "nyc-brand-house",
    title: "Brand house — group stage weekend",
    date: "June 15, 2026",
    categoryId: "brand",
    description:
      "Polished production and a guest mix worth knowing.",
  },
  {
    id: "nyc-hospitality-pathway",
    title: "Selected hospitality viewing pathway",
    date: "July 2026",
    categoryId: "hospitality",
    description:
      "Lounge access and hosted service — considered, not crowded.",
  },
  {
    id: "nyc-final-eve",
    title: "Final week gathering — New York metro",
    date: "July 18, 2026",
    categoryId: "social",
    description:
      "A pre-final evening for those in town for the closing stretch.",
  },
];

export function getCategoryLabel(categoryId: EditorCategoryId): string {
  return EDITOR_CATEGORIES.find((c) => c.id === categoryId)?.label ?? "Selected";
}

export function getPickById(id: string): CuratedPick | undefined {
  return NYC_CURATED_PICKS.find((pick) => pick.id === id);
}
