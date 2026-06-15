import { CalendarDays, ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PICK_CATEGORIES,
  getPickForCategory,
  isVerifiedPick,
} from "@/lib/curated-picks";

export function WeeklyPicksSection() {
  return (
    <section
      id="picks"
      className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16"
    >
      <div className="mb-10 flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          This week&apos;s picks
        </h2>
        <p className="text-sm text-muted-foreground">New York · June–July 2026</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PICK_CATEGORIES.map((category) => {
          const pick = getPickForCategory(category.id);
          const verified = pick && isVerifiedPick(pick);

          if (verified) {
            return (
              <Card key={category.id} className="bg-card/60">
                <CardHeader className="gap-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-primary">
                    {category.label}
                  </p>
                  <CardTitle className="text-base leading-snug">
                    {pick.title}
                  </CardTitle>
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="size-3.5 shrink-0" aria-hidden />
                      <span>{pick.date}</span>
                    </div>
                    <span>{pick.organizer}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {pick.description}
                  </p>
                  <a
                    href={pick.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    {pick.sourceName ?? "Source"}
                    <ExternalLink className="size-3.5" aria-hidden />
                  </a>
                </CardContent>
              </Card>
            );
          }

          return (
            <Card
              key={category.id}
              className="bg-card/40 border-dashed border-border/60"
            >
              <CardHeader className="gap-3">
                <p className="text-xs font-medium uppercase tracking-wide text-primary">
                  {category.label}
                </p>
                <CardTitle className="text-base text-muted-foreground">
                  Coming soon
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Coming soon.</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
