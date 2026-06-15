"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CuratedPick } from "@/lib/curated-picks";
import {
  EDITOR_CATEGORIES,
  NYC_CURATED_PICKS,
  getCategoryLabel,
} from "@/lib/curated-picks";

export function EditorsPicksSection() {
  return (
    <section
      id="picks"
      className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16"
    >
      <div className="mb-10 flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
          Editor&apos;s picks
        </p>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Selected gatherings in New York
        </h2>
        <p className="max-w-2xl text-muted-foreground">
          June–July 2026 · A short, curated list — not a database. Each pick is
          an invite-oriented room we&apos;d actually attend.
        </p>
      </div>

      <div className="mb-10 flex flex-wrap gap-2">
        {EDITOR_CATEGORIES.map((category) => (
          <span
            key={category.id}
            className="rounded-full border border-border/60 bg-muted/20 px-3 py-1 text-xs text-muted-foreground"
          >
            🏆 {category.label}
          </span>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {NYC_CURATED_PICKS.map((pick) => (
          <PickCard key={pick.id} pick={pick} />
        ))}
      </div>
    </section>
  );
}

function PickCard({ pick }: { pick: CuratedPick }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleInterest(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "event-interest",
          email,
          name: name.trim() || undefined,
          eventId: pick.id,
          eventTitle: pick.title,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong.");
        return;
      }

      setSubmitted(true);
      setShowForm(false);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="bg-card/60">
      <CardHeader className="gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">
          Editor&apos;s pick · {getCategoryLabel(pick.categoryId)}
        </p>
        <CardTitle className="text-base leading-snug">{pick.title}</CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="size-3.5 shrink-0" aria-hidden />
          <span>{pick.date}</span>
          <span className="text-border">·</span>
          <span>New York</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {pick.description}
        </p>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-3 border-t border-border/40 bg-transparent pt-4">
        {submitted ? (
          <p className="text-sm text-muted-foreground">
            Interest saved — we&apos;ll include this in your review if you apply.
          </p>
        ) : showForm ? (
          <form onSubmit={handleInterest} className="flex flex-col gap-2">
            <Input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-9"
            />
            <Input
              type="text"
              placeholder="Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Save interest"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowForm(true)}
          >
            Interested in this gathering
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
