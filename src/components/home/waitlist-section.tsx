"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { US_HOST_CITIES, type HostCityOption } from "@/lib/leads/types";

export function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [city, setCity] = useState<HostCityOption>("New York / NJ");
  const [nycPlusInterest, setNycPlusInterest] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "platform-waitlist",
          email,
          city,
          nycPlusInterest:
            city === "New York / NJ" ? true : nycPlusInterest,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong. Try again.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="waitlist" className="border-t border-border/60 bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Waitlist
          </h2>
          <p className="mt-3 text-muted-foreground">
            Updates on hospitality and host cities. NYC members hear about local
            watch parties, dinners, and private events.
          </p>

          {submitted ? (
            <div className="mt-8 rounded-xl border border-primary/30 bg-primary/10 px-6 py-8">
              <p className="font-medium text-primary">You&apos;re on the list.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                We&apos;ll email {email} when new opportunities match your city
                ({city}).
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-8 flex flex-col gap-4 text-left"
            >
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  type="email"
                  required
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-background/60 sm:flex-1"
                  aria-label="Email address"
                />
                <select
                  value={city}
                  onChange={(e) =>
                    setCity(e.target.value as HostCityOption)
                  }
                  className="h-11 rounded-md border border-input bg-background/60 px-3 text-sm"
                  aria-label="Your city"
                >
                  {US_HOST_CITIES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {city !== "New York / NJ" && (
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={nycPlusInterest}
                    onChange={(e) => setNycPlusInterest(e.target.checked)}
                    className="rounded border-input"
                  />
                  Also send NYC social access (dinners, private events) when I
                  travel
                </label>
              )}

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button
                type="submit"
                size="lg"
                className="h-11 w-full sm:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Joining…" : "Join waitlist"}
              </Button>
            </form>
          )}

          <p className="mt-6 text-xs text-muted-foreground">
            Hosts and partners:{" "}
            <Link href="/submit" className="underline hover:text-primary">
              submit a listing
            </Link>
            . We review everything before publishing.
          </p>
        </div>
      </div>
    </section>
  );
}
