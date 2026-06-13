import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="text-xs font-medium uppercase tracking-[0.35em] text-primary"
        >
          BLACKBOOK
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/#cities" className="hover:text-foreground">
            Host cities
          </Link>
          <Link href="/#waitlist" className="hover:text-foreground">
            Waitlist
          </Link>
          <Link href="/submit" className="hover:text-foreground">
            Submit
          </Link>
        </nav>
      </div>
    </header>
  );
}
