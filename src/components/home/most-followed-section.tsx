"use client";

import Link from "next/link";
import { useHome } from "@/components/home/home-provider";
import { formatLastUpdated } from "@/lib/opportunities/format";

export function MostFollowedSection() {
  const { insights } = useHome();
  const items = insights.mostFollowed;

  if (!items.length) {
    return null;
  }

  return (
    <section className="border-b border-border/60 bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Featured Opportunities
        </h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <Link
              key={item.recordId}
              href={`/opportunity/${item.slug}`}
              className="rounded-xl border border-border/60 bg-card/40 p-4 transition-colors hover:bg-card/60"
            >
              <p className="font-medium">{item.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.sublabel}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                Updated {formatLastUpdated(item.lastUpdated)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
