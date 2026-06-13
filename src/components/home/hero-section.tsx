import { ACCESS_TYPES } from "@/lib/opportunities/constants";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.25_0.04_85)_0%,_transparent_55%)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:py-32">
        <div className="flex flex-col gap-8">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
            BLACKBOOK · WORLD CUP 2026
          </p>
          <div className="flex flex-col gap-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              World Cup 2026 Access
            </h1>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-lg text-muted-foreground sm:text-xl">
              {ACCESS_TYPES.map((type) => (
                <span key={type}>{type}.</span>
              ))}
            </div>
          </div>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            Official hospitality, host-city venues, and premium experiences
            across the US. Request access, get alerts, and find where to go — we
            don&apos;t sell tickets or process transactions.
          </p>
          <p className="text-sm text-muted-foreground">
            Starting in NYC. National audience welcome — pick your city on the
            waitlist.
          </p>
        </div>
      </div>
    </section>
  );
}
