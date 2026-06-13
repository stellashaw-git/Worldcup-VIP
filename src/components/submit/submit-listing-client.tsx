"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const LISTING_TYPES = [
  "Hospitality package",
  "Watch party",
  "Private dinner / salon",
  "Hotel / travel package",
  "Members club event",
  "VIP lounge / suite",
  "Other curated experience",
];

export function SubmitListingClient() {
  const [submitterName, setSubmitterName] = useState("");
  const [submitterEmail, setSubmitterEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [listingTitle, setListingTitle] = useState("");
  const [listingType, setListingType] = useState(LISTING_TYPES[0]);
  const [city, setCity] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [description, setDescription] = useState("");
  const [listingUrl, setListingUrl] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/submit-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submitterName,
          submitterEmail,
          organization: organization || undefined,
          listingTitle,
          listingType,
          city,
          eventDate: eventDate || undefined,
          description,
          listingUrl: listingUrl || undefined,
          priceRange: priceRange || undefined,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? "Submission failed. Try again.");
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
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/"
        className={buttonVariants({
          variant: "ghost",
          size: "sm",
          className: "mb-8 -ml-2",
        })}
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back
      </Link>

      <header className="mb-10 flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          Submit a listing
        </h1>
        <p className="text-muted-foreground">
          Hosts, venues, hotels, and partners — share watch parties, hospitality,
          dinners, or travel packages. We review everything before publishing.
        </p>
      </header>

      {submitted ? (
        <div className="rounded-xl border border-primary/30 bg-primary/10 px-6 py-8">
          <p className="font-medium text-primary">Submission received.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Our team will review and publish if it fits BLACKBOOK&apos;s quality
            bar. We&apos;ll email {submitterEmail} if we need details.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Your name</span>
              <Input
                required
                value={submitterName}
                onChange={(e) => setSubmitterName(e.target.value)}
                className="bg-background/60"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Email</span>
              <Input
                type="email"
                required
                value={submitterEmail}
                onChange={(e) => setSubmitterEmail(e.target.value)}
                className="bg-background/60"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Organization (optional)</span>
            <Input
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="Venue, hotel, club, agency"
              className="bg-background/60"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Listing title</span>
            <Input
              required
              value={listingTitle}
              onChange={(e) => setListingTitle(e.target.value)}
              placeholder="e.g. NYC Founder Watch Party — USA vs Mexico"
              className="bg-background/60"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Type</span>
              <select
                value={listingType}
                onChange={(e) => setListingType(e.target.value)}
                className="h-10 rounded-md border border-input bg-background/60 px-3"
              >
                {LISTING_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">City</span>
              <Input
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="New York, Miami, Dallas…"
                className="bg-background/60"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Date (optional)</span>
              <Input
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                placeholder="June 15, 2026 or match week"
                className="bg-background/60"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Price range (optional)</span>
              <Input
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                placeholder="$150–$500 per person"
                className="bg-background/60"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Public URL (optional)</span>
            <Input
              type="url"
              value={listingUrl}
              onChange={(e) => setListingUrl(e.target.value)}
              placeholder="https://"
              className="bg-background/60"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Description</span>
            <textarea
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's included, who it's for, capacity, how to get access…"
              className="rounded-md border border-input bg-background/60 px-3 py-2 text-sm"
            />
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Submitting…" : "Submit for review"}
          </Button>
        </form>
      )}
    </div>
  );
}
