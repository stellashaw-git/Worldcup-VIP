import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:px-6">
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
          BLACKBOOK
        </p>
        <p>
          World Cup 2026 access · National alerts · NYC social access
        </p>
        <div className="flex flex-wrap gap-4 text-xs">
          <Link href="/#cities" className="hover:text-primary">
            Host cities
          </Link>
          <Link href="/#official-hubs" className="hover:text-primary">
            Official hubs
          </Link>
          <Link href="/#waitlist" className="hover:text-primary">
            Join waitlist
          </Link>
          <Link href="/submit" className="hover:text-primary">
            Submit listing
          </Link>
          <Link href="/admin/leads" className="hover:text-primary">
            Admin
          </Link>
        </div>
        <p className="text-xs leading-relaxed">
          Independent World Cup 2026 access directory. Official pathways to
          premium hospitality — we do not represent FIFA unless explicitly
          stated.
        </p>
      </div>
    </footer>
  );
}
