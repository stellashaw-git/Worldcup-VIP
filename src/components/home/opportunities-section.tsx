"use client";

import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useHome } from "@/components/home/home-provider";
import { OpportunityCard } from "@/components/home/opportunity-card";
import { SearchBar } from "@/components/home/search-bar";
import { Button } from "@/components/ui/button";
import type { MatchStage } from "@/lib/opportunities/types";

export function OpportunitiesSection() {
  const {
    records,
    isLoading,
    error,
    emptyMessage,
    refreshPublicResults,
  } = useHome();

  const [query, setQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState<MatchStage | "All">("All");

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return records.filter((record) => {
      const matchesStage =
        selectedStage === "All" || record.matchStage === selectedStage;

      if (!normalizedQuery) {
        return matchesStage;
      }

      const searchableText = [
        record.matchName,
        record.matchStage,
        record.city,
        record.venue,
        record.eventDate,
        record.accessType,
        record.hospitalityCategory,
        record.sourceName,
        record.summary,
        record.capacity,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesStage && searchableText.includes(normalizedQuery);
    });
  }, [records, query, selectedStage]);

  return (
    <>
      <SearchBar
        query={query}
        onQueryChange={setQuery}
        selectedStage={selectedStage}
        onStageChange={setSelectedStage}
      />
      <section id="opportunities" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Access Database
            </h2>
            <p className="text-muted-foreground">
              Structured World Cup 2026 hospitality intelligence from public
              sources — compare match, venue, pricing, and source before
              inquiring.
            </p>
          </div>
          <Button
            type="button"
            onClick={refreshPublicResults}
            disabled={isLoading}
            className="shrink-0"
          >
            <RefreshCw
              className={`size-4 ${isLoading ? "animate-spin" : ""}`}
              aria-hidden
            />
            Refresh live data
          </Button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {isLoading && records.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
            <p className="font-medium">Loading starter directory…</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Official hubs load instantly. Live scrape may take up to 2 minutes.
            </p>
          </div>
        ) : filteredRecords.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRecords.map((record) => (
              <OpportunityCard key={record.id} record={record} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
            <p className="font-medium">
              {emptyMessage ??
                (records.length === 0
                  ? "Click Refresh Public Results to build the access database."
                  : "No records match your search.")}
            </p>
          </div>
        )}
      </section>
    </>
  );
}
