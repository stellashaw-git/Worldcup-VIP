export const EDITOR_CATEGORIES = [
  { id: "watch", label: "Best watch experience" },
  { id: "private", label: "Best private viewing" },
  { id: "social", label: "Best social gathering" },
  { id: "brand", label: "Best brand experience" },
  { id: "hospitality", label: "Best hospitality experience" },
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
      "An intimate watch gathering with a strong crowd and a well-run room — the kind of place where people stay for the full match and linger afterward.",
  },
  {
    id: "nyc-rooftop-opening",
    title: "Rooftop opening weekend screening",
    date: "June 12, 2026",
    categoryId: "watch",
    description:
      "Elevated skyline views and a social first half — curated for people who want atmosphere without the stadium crush.",
  },
  {
    id: "nyc-lounge-viewing",
    title: "Midtown lounge viewing salon",
    date: "June 21, 2026",
    categoryId: "private",
    description:
      "A quieter, invite-oriented room with reserved seating and a guest list that skews toward operators and investors who actually watch the game.",
  },
  {
    id: "nyc-supper-club",
    title: "Supper club match night",
    date: "June 28, 2026",
    categoryId: "social",
    description:
      "Dinner before kickoff, screens during the match, conversation after — a classic New York evening built around the tournament.",
  },
  {
    id: "nyc-brand-house",
    title: "Brand house — group stage weekend",
    date: "June 15, 2026",
    categoryId: "brand",
    description:
      "A polished brand-led experience with good production value and a guest mix that’s worth meeting if you care about culture and sport.",
  },
  {
    id: "nyc-hospitality-pathway",
    title: "Selected hospitality viewing pathway",
    date: "July 2026",
    categoryId: "hospitality",
    description:
      "A premium hospitality route we’re tracking for members — lounge access, hosted service, and a room that feels considered rather than crowded.",
  },
  {
    id: "nyc-final-eve",
    title: "Final week gathering — New York metro",
    date: "July 18, 2026",
    categoryId: "social",
    description:
      "A pre-final social gathering for people flying in for the closing stretch — light, social, and oriented around shared interest in the tournament.",
  },
];

export function getCategoryLabel(categoryId: EditorCategoryId): string {
  return EDITOR_CATEGORIES.find((c) => c.id === categoryId)?.label ?? "Editor's pick";
}

export function getPickById(id: string): CuratedPick | undefined {
  return NYC_CURATED_PICKS.find((pick) => pick.id === id);
}
