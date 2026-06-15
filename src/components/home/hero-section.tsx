import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.25_0.04_85)_0%,_transparent_55%)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
        <div className="flex max-w-2xl flex-col gap-8">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
            BLACKBOOK · NEW YORK
          </p>

          <div className="flex flex-col gap-5">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              World Cup Social Guide
            </h1>
            <p className="text-lg text-foreground/90 leading-relaxed sm:text-xl">
              Curated events, watch parties, and experiences for founders,
              investors, operators, creators, and premium guests during World Cup
              2026.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed sm:text-lg">
              We&apos;ve collected the premium gatherings worth knowing about in
              New York — selective rooms where high-value people watch together
              and share the same interest in the tournament.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="#apply"
              className={buttonVariants({ size: "lg", className: "h-11 px-6" })}
            >
              Apply for review
            </Link>
            <Link
              href="#picks"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "h-11 px-6",
              })}
            >
              View editor&apos;s picks
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
