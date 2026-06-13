import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

const VALUE_POINTS = [
  "Suites, lounges & official hospitality packages",
  "Browse city → stadium → package",
  "Early alerts when premium inventory opens",
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
              The matches everyone wants. The access few get.
            </p>
            <p className="text-base text-muted-foreground sm:text-lg">
              Official hospitality across every US host city — from the Final at
              MetLife to premium lounges in Miami. Inventory is limited and moves
              fast.
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
              href="#cities"
              className={buttonVariants({ size: "lg", className: "h-11 px-6" })}
            >
              Explore host cities
            </Link>
            <Link
              href="#waitlist"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "h-11 px-6",
              })}
            >
              Get early access
            </Link>
          </div>

          <p className="text-sm font-medium text-primary/90">
            Final host: New York Metro · Packages opening now — don&apos;t wait
            until it&apos;s gone.
          </p>
        </div>
      </div>
    </section>
  );
}
