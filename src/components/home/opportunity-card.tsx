"use client";

import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { OpportunityEngagementActions } from "@/components/engagement/opportunity-engagement-actions";
import {
  availabilityVariant,
  formatCapacity,
  formatField,
  formatLastUpdated,
  formatPriceRange,
} from "@/lib/opportunities/format";
import {
  formatHospitalityCategory,
  getStageBadgeLabel,
} from "@/lib/opportunities/infer-official";
import type { AccessRecord } from "@/lib/opportunities/types";

export function OpportunityCard({ record }: { record: AccessRecord }) {
  const location =
    record.venue !== "Unknown"
      ? `${record.venue}\n${record.city}`
      : formatField(record.city);

  const stageLabel = getStageBadgeLabel(record);

  return (
    <Card className="bg-card/60 transition-colors hover:bg-card/80">
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base leading-snug">
            <Link
              href={`/opportunity/${record.slug}`}
              className="transition-colors hover:text-primary"
            >
              {formatField(record.matchName)}
            </Link>
          </CardTitle>
          <Badge variant={availabilityVariant[record.availability]}>
            {record.availability}
          </Badge>
        </div>
        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <span className="whitespace-pre-line">{location}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="size-3.5 shrink-0" aria-hidden />
            <span>{formatField(record.eventDate)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Category</span>
          <span className="text-right font-medium">
            {formatHospitalityCategory(record.hospitalityCategory)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Access</span>
          <span className="text-right font-medium">
            {formatField(record.accessType)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Capacity</span>
          <span className="text-right">{formatCapacity(record.capacity)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Price</span>
          <span className="text-right font-medium">
            {formatPriceRange(
              record.priceMin,
              record.priceMax,
              record.currency
            )}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Source</span>
          <span className="text-right">{formatField(record.sourceName)}</span>
        </div>
        <p className="pt-1 text-xs text-muted-foreground">
          Updated {formatLastUpdated(record.lastUpdated)}
        </p>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-2 border-t-0 bg-transparent sm:flex-row sm:items-center">
        {stageLabel && <Badge variant="outline">{stageLabel}</Badge>}
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          <OpportunityEngagementActions record={record} />
          <Link
            href={`/opportunity/${record.slug}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            View details
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
