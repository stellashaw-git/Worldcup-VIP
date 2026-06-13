"use client";

import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { useHome } from "@/components/home/home-provider";
import {
  countCityListings,
  HOST_CITY_CATALOG,
} from "@/lib/opportunities/hierarchy";

export function CitiesBrowseSection() {
  const { records } = useHome();

  const cities = HOST_CITY_CATALOG.filter(
    (city) => countCityListings(records, city.slug) > 0
  );

  return (
    <section id="cities" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-8 flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Browse by host city
        </h2>
        <p className="text-muted-foreground">
          Pick your city → stadium → hospitality package. Inventory is limited
          and moves fast.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map((city) => {
          const listingCount = countCityListings(records, city.slug);
          return (
            <Link
              key={city.slug}
              href={`/city/${city.slug}`}
              className="group flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-5 transition-colors hover:border-primary/40 hover:bg-card/60"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-primary">
                  <MapPin className="size-4 shrink-0" aria-hidden />
                  <span className="text-xs font-medium uppercase tracking-wide">
                    Host city
                  </span>
                </div>
                {city.featured && (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                    Final host
                  </span>
                )}
              </div>
              <div>
                <p className="text-lg font-semibold">{city.headline}</p>
                <p className="mt-1 text-sm text-muted-foreground">{city.hook}</p>
              </div>
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-xs text-muted-foreground">
                  {listingCount} pathways listed
                </span>
                <span className="inline-flex items-center gap-1 text-sm text-primary">
                  Explore
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
  );
}
