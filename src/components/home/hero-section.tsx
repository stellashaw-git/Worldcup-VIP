import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.25_0.04_85)_0%,_transparent_55%)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <div className="flex max-w-xl flex-col gap-8">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
            BLACKBOOK · NEW YORK
          </p>

          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              World Cup Social Guide
            </h1>
            <p className="text-lg leading-relaxed text-foreground/90 sm:text-xl">
              Watch gatherings, private viewings, dinners, and selected
              hospitality — curated for New York during World Cup 2026.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              A selective social calendar for people who want to get out, meet
              others who care about the game, and celebrate the tournament
              together.
            </p>
            <p className="text-sm text-muted-foreground">
              Approved members receive curated updates and invites throughout
              the season.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="#apply"
              className={buttonVariants({ size: "lg", className: "h-11 px-6" })}
            >
              Apply
            </Link>
            <Link
              href="#picks"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "h-11 px-6",
              })}
            >
              View picks
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
