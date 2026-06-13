"use client";

import Link from "next/link";
import { useHome } from "@/components/home/home-provider";

export function TrendingNowSection() {
  const { insights } = useHome();
  const trending = insights.trending;

  if (!trending.length) {
    return null;
  }

  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Trending Now
        </h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {trending.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-border/60 bg-card/40 p-4 transition-colors hover:bg-card/60"
            >
              {item.slug ? (
                <Link
                  href={`/opportunity/${item.slug}`}
                  className="flex flex-col gap-1"
                >
                  <p className="text-sm font-medium">
                    <span className="text-primary">🔥 </span>
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </Link>
              ) : (
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">
                    <span className="text-primary">🔥 </span>
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
