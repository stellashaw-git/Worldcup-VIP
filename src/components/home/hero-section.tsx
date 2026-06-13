import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

const VALUE_POINTS = [
  "Official hospitality & venue packages",
  "US host cities — filter by type",
  "Alerts & access requests — not a ticket store",
] as const;

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.25_0.04_85)_0%,_transparent_55%)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
        <div className="flex max-w-3xl flex-col gap-8">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
            BLACKBOOK · WORLD CUP 2026
          </p>

          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              World Cup 2026 Access
            </h1>
            <p className="text-lg text-foreground/90 sm:text-xl">
              Find hospitality, host-city venues, and premium experiences across
              the US — beyond regular tickets.
            </p>
          </div>

          <ul className="flex flex-col gap-2 text-sm text-muted-foreground sm:text-base">
            {VALUE_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="#opportunities"
              className={buttonVariants({ size: "lg", className: "h-11 px-6" })}
            >
              Browse access
            </Link>
            <Link
              href="#waitlist"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "h-11 px-6",
              })}
            >
              Get alerts
            </Link>
          </div>

          <p className="text-sm text-muted-foreground">
            We don&apos;t sell tickets or process payments — we show official
            paths and premium options. Pick your city on the waitlist.
          </p>
        </div>
      </div>
    </section>
  );
}
