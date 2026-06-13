"use client";

import Link from "next/link";
import { ArrowRight, Globe } from "lucide-react";
import { useHome } from "@/components/home/home-provider";
import { getOfficialHubs } from "@/lib/opportunities/hierarchy";
import { formatField } from "@/lib/opportunities/format";

export function OfficialHubsSection() {
  const { records } = useHome();
  const hubs = getOfficialHubs(records);

  if (hubs.length === 0) return null;

  return (
    <section
      id="official-hubs"
      className="border-b border-border/60 bg-muted/10"
    >
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Official entry points
          </h2>
          <p className="text-sm text-muted-foreground">
            Start with FIFA and official partners — then narrow to your city
            and stadium.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {hubs.map((hub) => (
            <Link
              key={hub.id}
              href={`/opportunity/${hub.slug}`}
              className="group flex flex-col gap-3 rounded-xl border border-border/60 bg-background/40 p-5 transition-colors hover:border-primary/40"
            >
              <Globe className="size-5 text-primary" aria-hidden />
              <div>
                <p className="font-medium">{formatField(hub.matchName)}</p>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {hub.summary}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-sm text-primary">
                {hub.actionLabel ?? "View official packages"}
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
