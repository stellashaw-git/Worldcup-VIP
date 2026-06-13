import Link from "next/link";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { OpportunityCard } from "@/components/home/opportunity-card";
import { buttonVariants } from "@/components/ui/button";
import {
  getCityBySlug,
  getTravelBundlesForCity,
  getVenuesForCity,
  countVenueListings,
} from "@/lib/opportunities/hierarchy";
import type { AccessRecord } from "@/lib/opportunities/types";

export function CityPageContent({
  citySlug,
  records,
}: {
  citySlug: string;
  records: AccessRecord[];
}) {
  const city = getCityBySlug(citySlug);
  if (!city) return null;

  const venues = getVenuesForCity(records, citySlug);
  const travelBundles = getTravelBundlesForCity(records, citySlug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/#cities"
        className={buttonVariants({
          variant: "ghost",
          size: "sm",
          className: "mb-8 -ml-2",
        })}
      >
        <ArrowLeft className="size-4" aria-hidden />
        All host cities
      </Link>

      <header className="mb-10 flex flex-col gap-4 border-b border-border/60 pb-8">
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
          HOST CITY
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {city.headline}
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">{city.hook}</p>
        <p className="text-sm text-muted-foreground">
          Select a stadium to compare hospitality packages — suites, lounges,
          and club access.
        </p>
      </header>

      {venues.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold">Stadiums & venues</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {venues.map((venue) => {
              const count = countVenueListings(records, venue.slug);
              return (
                <Link
                  key={venue.slug}
                  href={`/venue/${venue.slug}`}
                  className="group flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-5 transition-colors hover:border-primary/40"
                >
                  <div className="flex items-center gap-2 text-primary">
                    <MapPin className="size-4" aria-hidden />
                    <span className="text-sm font-medium">{venue.name}</span>
                  </div>
                  {venue.hook && (
                    <p className="text-sm text-muted-foreground">{venue.hook}</p>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">
                      {count} listings
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm text-primary">
                      View packages
                      <ArrowRight
                        className="size-4 transition-transform group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {travelBundles.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Hotels & travel</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {travelBundles.map((record) => (
              <OpportunityCard key={record.id} record={record} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
