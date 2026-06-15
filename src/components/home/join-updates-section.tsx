"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function JoinUpdatesSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("New York");
  const [linkedin, setLinkedin] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "join-updates",
          name,
          email,
          city,
          linkedin: linkedin.trim() || undefined,
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
    <section id="updates" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-xl">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Join updates
        </h2>
        <p className="mt-3 text-muted-foreground">
          Get weekly curated World Cup event recommendations.
        </p>

        {submitted ? (
          <div className="mt-8 rounded-xl border border-border/60 bg-muted/20 px-6 py-8">
            <p className="font-medium">You&apos;re on the list.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              We&apos;ll send curated picks each week during the tournament.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Name</span>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Email</span>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">City</span>
              <Input
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-11"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">
                LinkedIn{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </span>
              <Input
                type="url"
                placeholder="https://linkedin.com/in/..."
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="h-11"
              />
            </label>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Submitting…" : "Join updates"}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
