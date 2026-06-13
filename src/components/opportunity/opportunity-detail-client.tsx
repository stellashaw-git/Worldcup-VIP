"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { OpportunityDetailView } from "@/components/opportunity/opportunity-detail-view";
import { DIRECTORY_SESSION_KEY } from "@/components/home/home-provider";
import { buttonVariants } from "@/components/ui/button";
import type {
  AccessRecord,
  GroupedEvent,
  SearchOpportunitiesResponse,
} from "@/lib/opportunities/types";

export function OpportunityDetailClient({ slug }: { slug: string }) {
  const [record, setRecord] = useState<AccessRecord | null>(null);
  const [groupedEvent, setGroupedEvent] = useState<GroupedEvent | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(DIRECTORY_SESSION_KEY);
      if (stored) {
        const data = JSON.parse(stored) as SearchOpportunitiesResponse;
        const match = data.records?.find(
          (item) => item.slug === slug || item.id === slug
        );
        if (match) {
          setRecord(match);
          setGroupedEvent(
            data.groupedEvents?.find((g) => g.groupKey === match.groupKey)
          );
        }
      }
    } catch {
      setRecord(null);
    }

    setIsLoading(false);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">
        Loading record...
      </div>
    );
  }

  if (!record) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="font-medium">Record not found.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Refresh public results on the home page, then open this record again.
        </p>
        <Link
          href="/"
          className={buttonVariants({ variant: "outline", className: "mt-6" })}
        >
          Back to database
        </Link>
      </div>
    );
  }

  return <OpportunityDetailView record={record} groupedEvent={groupedEvent} />;
}
