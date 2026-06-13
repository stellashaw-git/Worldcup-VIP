"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MATCH_STAGES, type MatchStage } from "@/lib/opportunities/types";
import { cn } from "@/lib/utils";

type SearchBarProps = {
  query: string;
  onQueryChange: (query: string) => void;
  selectedStage: MatchStage | "All";
  onStageChange: (stage: MatchStage | "All") => void;
};

export function SearchBar({
  query,
  onQueryChange,
  selectedStage,
  onStageChange,
}: SearchBarProps) {
  const stages: Array<MatchStage | "All"> = [
    "All",
    ...MATCH_STAGES.filter((stage) => stage !== "Unknown"),
  ];

  return (
    <section className="border-b border-border/60 bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              placeholder="Search match, venue, city, source, or access type..."
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              className="h-11 bg-background/60 pl-9"
              aria-label="Search opportunities"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {stages.map((stage) => (
              <button
                key={stage}
                type="button"
                onClick={() => onStageChange(stage)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  selectedStage === stage
                    ? "border-primary/40 bg-primary/15 text-primary"
                    : "border-border bg-background/40 text-muted-foreground hover:border-border hover:text-foreground"
                )}
              >
                {stage}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
