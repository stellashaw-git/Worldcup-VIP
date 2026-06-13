"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AccessRecord } from "@/lib/opportunities/types";

type LeadAction = "waitlist" | "updates" | "access-request";

export function OpportunityLeadCta({ record }: { record: AccessRecord }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submittedAction, setSubmittedAction] = useState<LeadAction | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;

    const formData = new FormData(event.currentTarget);
    const action = formData.get("action") as LeadAction;

    setIsSubmitting(true);
    setError(null);

    try {
      if (action === "access-request") {
        const response = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "access-request",
            email,
            recordId: record.id,
            recordTitle: record.matchName,
            city: record.city,
            message: message || undefined,
          }),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          setError(data.error ?? "Request failed.");
          return;
        }
      } else {
        await fetch("/api/engagement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: action === "waitlist" ? "waitlist" : "request-update",
            recordId: record.id,
            meta: {
              city: record.city,
              category: record.accessType,
              matchStage: record.matchStage,
            },
          }),
        });
      }

      setSubmittedAction(action);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-xl border border-border/60 bg-muted/20 p-6 sm:p-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Request access or get updates
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            We route qualified inquiries to official partners and hosts. No
            transactions on BLACKBOOK.
          </p>
        </div>

        {submittedAction ? (
          <div className="rounded-lg border border-primary/30 bg-primary/10 px-5 py-6">
            <p className="font-medium text-primary">
              {submittedAction === "waitlist"
                ? "You're on the waitlist."
                : submittedAction === "access-request"
                  ? "Access request received."
                  : "Update request received."}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              We&apos;ll reach out at {email} about {record.matchName}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="email"
              name="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 bg-background/60"
              aria-label="Email address"
            />
            <textarea
              name="message"
              rows={3}
              placeholder="Optional: group size, dates, budget, NYC travel…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="rounded-md border border-input bg-background/60 px-3 py-2 text-sm"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="submit"
                name="action"
                value="access-request"
                size="lg"
                className="h-11 sm:flex-1"
                disabled={isSubmitting}
              >
                Request access
              </Button>
              <Button
                type="submit"
                name="action"
                value="updates"
                variant="outline"
                size="lg"
                className="h-11 sm:flex-1"
                disabled={isSubmitting}
              >
                Request updates
              </Button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
