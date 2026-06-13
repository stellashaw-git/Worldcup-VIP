"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { OpportunityEngagementActions } from "@/components/engagement/opportunity-engagement-actions";
import { OpportunityLeadCta } from "@/components/opportunity/opportunity-lead-cta";
import {
  availabilityVariant,
  formatCapacity,
  formatField,
  formatLastUpdated,
  formatPriceRange,
} from "@/lib/opportunities/format";
import type { AccessRecord, GroupedEvent } from "@/lib/opportunities/types";

type DetailFieldProps = {
  label: string;
  value: string;
};

function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  );
}

export function OpportunityDetailView({
  record,
  groupedEvent,
}: {
  record: AccessRecord;
  groupedEvent?: GroupedEvent;
}) {
  useEffect(() => {
    fetch("/api/engagement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "view",
        recordId: record.id,
        meta: {
          city: record.city,
          category: record.accessType,
          matchStage: record.matchStage,
        },
      }),
    }).catch(() => {
      // Non-blocking.
    });
  }, [record]);

  const comparisonOfferings =
    groupedEvent?.offerings.filter(
      (offering) =>
        offering.priceMin !== null ||
        offering.priceMax !== null ||
        offering.sourceName !== "Unknown"
    ) ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/"
        className={buttonVariants({
          variant: "ghost",
          size: "sm",
          className: "mb-8 -ml-2",
        })}
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to database
      </Link>

      <div className="flex flex-col gap-10">
        <header className="flex flex-col gap-4 border-b border-border/60 pb-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {formatField(record.matchName)}
            </h1>
            <Badge variant={availabilityVariant[record.availability]}>
              {record.availability}
            </Badge>
          </div>
          <p className="text-lg text-muted-foreground">
            {record.matchStageDetail
              ? record.matchStageDetail
              : formatField(record.matchStage)}{" "}
            · {formatField(record.accessType)}
          </p>
          <p className="text-sm text-muted-foreground">
            Reference listings from public sources — request access or visit the
            official publisher.
          </p>
          <OpportunityEngagementActions record={record} size="default" />
          {record.sourceUrl && (
            <a
              href={record.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ size: "lg", className: "h-11" })}
            >
              {record.actionLabel ?? "View official source"}
              <ExternalLink className="size-4" aria-hidden />
            </a>
          )}
        </header>

        <dl className="grid gap-6 sm:grid-cols-2">
          <DetailField label="What is this?" value={formatField(record.matchName)} />
          <DetailField label="When is it?" value={formatField(record.eventDate)} />
          {record.kickoffTime && (
            <DetailField label="Kickoff" value={record.kickoffTime} />
          )}
          <DetailField
            label="Where is it?"
            value={
              record.venue !== "Unknown"
                ? `${record.venue}, ${record.city}`
                : formatField(record.city)
            }
          />
          <DetailField
            label="Product"
            value={formatField(record.productName ?? record.matchName)}
          />
          <DetailField
            label="Access type"
            value={formatField(record.accessType)}
          />
          <DetailField
            label="Estimated price"
            value={formatPriceRange(
              record.priceMin,
              record.priceMax,
              record.currency
            )}
          />
          <DetailField label="Source" value={formatField(record.sourceName)} />
          <DetailField
            label="Publisher type"
            value={formatField(record.sourceType)}
          />
          <DetailField
            label="Last updated"
            value={formatLastUpdated(record.lastUpdated)}
          />
          <DetailField label="Capacity" value={formatCapacity(record.capacity)} />
          <DetailField
            label="Hospitality category"
            value={formatField(record.hospitalityCategory)}
          />
        </dl>

        {comparisonOfferings.length > 1 && (
          <section className="flex flex-col gap-4 border-t border-border/60 pt-8">
            <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Public Price Comparison
            </h2>
            <p className="text-sm text-muted-foreground">
              {formatField(record.matchName)} · {formatField(record.venue)}
            </p>
            <div className="overflow-hidden rounded-xl border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Access</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonOfferings.map((offering) => (
                    <tr
                      key={offering.recordId}
                      className="border-t border-border/60"
                    >
                      <td className="px-4 py-3 font-medium">
                        {offering.slug === record.slug ? (
                          offering.sourceName
                        ) : (
                          <Link
                            href={`/opportunity/${offering.slug}`}
                            className="hover:text-primary"
                          >
                            {offering.sourceName}
                          </Link>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatField(offering.accessType)}
                      </td>
                      <td className="px-4 py-3">
                        {formatPriceRange(
                          offering.priceMin,
                          offering.priceMax,
                          offering.currency
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {offering.availability}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Summary
          </h2>
          <p className="text-sm leading-relaxed text-foreground/90">
            {record.summary}
          </p>
        </section>

        {record.sourceUrl && (
          <section className="flex flex-col gap-2 border-t border-border/60 pt-6">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Public Reference
            </h2>
            <a
              href={record.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              View public source ({formatField(record.sourceName)})
              <ExternalLink className="size-3 shrink-0" aria-hidden />
            </a>
          </section>
        )}

        <OpportunityLeadCta record={record} />

        <p className="text-xs leading-relaxed text-muted-foreground">
          BLACKBOOK is an independent World Cup 2026 access directory. We help
          users find official hospitality and premium options. We do not
          represent FIFA unless explicitly stated.
        </p>
      </div>
    </div>
  );
}
