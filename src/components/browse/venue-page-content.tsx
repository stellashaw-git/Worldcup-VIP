import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { OpportunityCard } from "@/components/home/opportunity-card";
import { buttonVariants } from "@/components/ui/button";
import {
  getCityBySlug,
  getHospitalityProducts,
  getVenueBySlug,
  getVenuePortal,
} from "@/lib/opportunities/hierarchy";
import type { AccessRecord } from "@/lib/opportunities/types";

export function VenuePageContent({
  venueSlug,
  records,
}: {
  venueSlug: string;
  records: AccessRecord[];
}) {
  const venue = getVenueBySlug(venueSlug);
  if (!venue) return null;

  const city = getCityBySlug(venue.citySlug);
  const portal = getVenuePortal(records, venueSlug);
  const products = getHospitalityProducts(records, venueSlug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href={`/city/${venue.citySlug}`}
        className={buttonVariants({
          variant: "ghost",
          size: "sm",
          className: "mb-8 -ml-2",
        })}
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to {city?.headline ?? "city"}
      </Link>

      <header className="mb-10 flex flex-col gap-4 border-b border-border/60 pb-8">
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
          {city?.headline ?? "Host city"} · VENUE
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {venue.name}
        </h1>
        {venue.hook && (
          <p className="max-w-2xl text-lg text-muted-foreground">{venue.hook}</p>
        )}
        <p className="text-sm text-muted-foreground">
          Hospitality packages and premium access for matches at this stadium.
        </p>
        {portal && (
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href={portal.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ size: "lg" })}
            >
              {portal.actionLabel ?? "View official venue hospitality"}
              <ExternalLink className="size-4" aria-hidden />
            </a>
            <Link
              href={`/opportunity/${portal.slug}`}
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Details on BLACKBOOK
            </Link>
          </div>
        )}
      </header>

      {products.length > 0 && (
        <section>
          <h2 className="mb-2 text-xl font-semibold">Hospitality packages</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Limited inventory — request access before packages sell out.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((record) => (
              <OpportunityCard key={record.id} record={record} />
            ))}
          </div>
        </section>
      )}

      {products.length === 0 && portal && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Packages</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <OpportunityCard record={portal} />
          </div>
        </section>
      )}
    </div>
  );
}
