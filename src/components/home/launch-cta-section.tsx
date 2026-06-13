"use client";

import Link from "next/link";
import { ArrowRight, Building2, Mail, Upload } from "lucide-react";

export function LaunchCtaSection() {
  return (
    <section className="border-b border-border/60 bg-muted/10">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="#opportunities"
            className="group flex flex-col gap-3 rounded-xl border border-border/60 bg-background/40 p-5 transition-colors hover:border-primary/40"
          >
            <Building2 className="size-5 text-primary" aria-hidden />
            <div>
              <p className="font-medium">Browse access</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Official FIFA hubs, stadium venues, hotels, and travel
                partners.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-sm text-primary">
              Explore
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>

          <Link
            href="#waitlist"
            className="group flex flex-col gap-3 rounded-xl border border-border/60 bg-background/40 p-5 transition-colors hover:border-primary/40"
          >
            <Mail className="size-5 text-primary" aria-hidden />
            <div>
              <p className="font-medium">Get alerts</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Email updates by city — US coverage plus NYC social access.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-sm text-primary">
              Join waitlist
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>

          <Link
            href="/submit"
            className="group flex flex-col gap-3 rounded-xl border border-border/60 bg-background/40 p-5 transition-colors hover:border-primary/40"
          >
            <Upload className="size-5 text-primary" aria-hidden />
            <div>
              <p className="font-medium">Submit a listing</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Hosts, venues, and hotels — reviewed before we publish.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-sm text-primary">
              Submit
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
