"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MEMBER_INTERESTS,
  MEMBER_ROLES,
  type MemberInterest,
  type MemberRole,
} from "@/lib/leads/types";

export function MemberApplicationSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [role, setRole] = useState<MemberRole>("Founder");
  const [interests, setInterests] = useState<MemberInterest[]>([
    "Watch gatherings",
  ]);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggleInterest(interest: MemberInterest) {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (interests.length === 0) {
      setError("Select at least one interest.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "member-application",
          name,
          email,
          linkedin,
          company,
          website,
          role,
          interests,
          note: note.trim() || undefined,
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
    <section
      id="apply"
      className="border-t border-border/60 bg-muted/10"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-xl">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
            Application
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            Apply
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We review every application. Approved members receive curated updates
            and invites in New York.
          </p>

          {submitted ? (
            <div className="mt-8 rounded-xl border border-primary/30 bg-primary/10 px-6 py-8">
              <p className="font-medium text-primary">Received.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                If approved, we&apos;ll send curated member updates throughout
                World Cup 2026.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-8 flex flex-col gap-5"
            >
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
                <span className="font-medium">LinkedIn</span>
                <Input
                  type="url"
                  required
                  placeholder="https://linkedin.com/in/..."
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="h-11"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">Company</span>
                <Input
                  required
                  placeholder="Company name"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="h-11"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">Website</span>
                <Input
                  type="url"
                  required
                  placeholder="company.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="h-11"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">Role</span>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as MemberRole)}
                  className="h-11 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {MEMBER_ROLES.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>

              <fieldset className="flex flex-col gap-2">
                <legend className="text-sm font-medium">Interests</legend>
                <div className="flex flex-wrap gap-2">
                  {MEMBER_INTERESTS.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        interests.includes(interest)
                          ? "border-primary/40 bg-primary/15 text-primary"
                          : "border-border bg-background/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">
                  Note{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </label>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Submitting…" : "Submit"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
