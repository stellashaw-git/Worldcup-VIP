"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ACCESS_TYPES,
  MATCH_STAGES,
  type AccessRecord,
  type ReviewQueueItem,
  type ReviewStatus,
} from "@/lib/opportunities/types";
import { formatPriceRange } from "@/lib/opportunities/format";

const ADMIN_TOKEN_KEY = "blackbook_admin_token";

type EditForm = {
  matchName: string;
  matchStage: AccessRecord["matchStage"];
  city: string;
  venue: string;
  eventDate: string;
  accessType: AccessRecord["accessType"];
  capacity: string;
  priceMin: string;
  priceMax: string;
  availability: AccessRecord["availability"];
  summary: string;
};

function toEditForm(item: ReviewQueueItem): EditForm {
  const draft = item.recordDraft;
  return {
    matchName: item.title,
    matchStage: draft.matchStage,
    city: draft.city,
    venue: draft.venue,
    eventDate: draft.eventDate,
    accessType: draft.accessType,
    capacity: draft.capacity,
    priceMin: draft.priceMin?.toString() ?? "",
    priceMax: draft.priceMax?.toString() ?? "",
    availability: draft.availability,
    summary: draft.summary,
  };
}

function statusVariant(status: ReviewStatus): "default" | "secondary" | "outline" {
  switch (status) {
    case "Approved":
      return "default";
    case "Rejected":
      return "outline";
    default:
      return "secondary";
  }
}

export function AdminReviewClient() {
  const [token, setToken] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [items, setItems] = useState<ReviewQueueItem[]>([]);
  const [filter, setFilter] = useState<ReviewStatus | "All">("Needs Review");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId]
  );

  const authHeaders = useCallback(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token]
  );

  const loadQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const statusQuery =
        filter === "All" ? "" : `?status=${encodeURIComponent(filter)}`;
      const response = await fetch(`/api/review-queue${statusQuery}`, {
        headers: token ? authHeaders() : undefined,
      });
      if (!response.ok) {
        throw new Error("Unable to load review queue. Check admin token.");
      }
      const data = (await response.json()) as { items: ReviewQueueItem[] };
      setItems(data.items);
      setAuthenticated(true);
      sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
      document.cookie = `blackbook_admin=${token}; path=/; SameSite=Strict`;
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Failed to load queue"
      );
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, [authHeaders, filter, token]);

  useEffect(() => {
    const stored = sessionStorage.getItem(ADMIN_TOKEN_KEY);
    if (stored) {
      setToken(stored);
    }
  }, []);

  useEffect(() => {
    if (token && authenticated) {
      loadQueue();
    }
  }, [filter, authenticated, loadQueue, token]);

  useEffect(() => {
    if (selectedItem) {
      setEditForm(toEditForm(selectedItem));
    } else {
      setEditForm(null);
    }
  }, [selectedItem]);

  function buildEdits(): Partial<AccessRecord> {
    if (!editForm) return {};
    const priceMin = editForm.priceMin ? Number(editForm.priceMin) : null;
    const priceMax = editForm.priceMax ? Number(editForm.priceMax) : null;

    return {
      matchName: editForm.matchName.trim(),
      matchStage: editForm.matchStage,
      city: editForm.city.trim() || "Unknown",
      venue: editForm.venue.trim() || "Unknown",
      eventDate: editForm.eventDate.trim() || "Unknown",
      accessType: editForm.accessType,
      capacity: editForm.capacity.trim() || "Unknown",
      priceMin: Number.isFinite(priceMin) ? priceMin : null,
      priceMax: Number.isFinite(priceMax) ? priceMax : null,
      availability: editForm.availability,
      summary: editForm.summary.trim(),
    };
  }

  async function runAction(action: "approve" | "reject" | "update") {
    if (!selectedId || !editForm) return;
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/review-queue/${selectedId}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({
          action,
          edits: buildEdits(),
          title: editForm.matchName.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Action failed (${response.status})`);
      }

      const data = await response.json();
      if (action === "approve") {
        setMessage(
          `Approved and published. Public directory now has ${data.publicCount ?? "?"} records.`
        );
      } else if (action === "reject") {
        setMessage("Lead rejected.");
      } else {
        setMessage("Draft saved.");
      }

      await loadQueue();
      if (action !== "update") {
        setSelectedId(null);
      }
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : "Action failed"
      );
    } finally {
      setLoading(false);
    }
  }

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Admin Review</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your admin secret to review low-confidence leads. In development,
          leave blank if ADMIN_SECRET is not set.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Input
            type="password"
            placeholder="Admin secret"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="h-11 bg-background/60"
          />
          <Button onClick={loadQueue} disabled={loading}>
            {loading ? "Connecting..." : "Enter"}
          </Button>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
          Admin
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Review Queue
        </h1>
        <p className="text-sm text-muted-foreground">
          Approve, edit, or reject leads before they appear on the public site.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {(["All", "Needs Review", "Approved", "Rejected"] as const).map(
          (status) => (
            <Button
              key={status}
              type="button"
              size="sm"
              variant={filter === status ? "default" : "outline"}
              onClick={() => setFilter(status)}
            >
              {status}
            </Button>
          )
        )}
      </div>

      {message && (
        <div className="mb-4 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          {loading && items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No items in this filter. Run Refresh Public Results on the home
              page to ingest new leads.
            </p>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  selectedId === item.id
                    ? "border-primary bg-primary/10"
                    : "border-border/60 bg-card/40 hover:bg-card/60"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium leading-snug">{item.title}</p>
                  <Badge variant={statusVariant(item.status)}>
                    {item.status}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.sourceName} · Score {item.confidenceScore}
                </p>
                <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                  {item.lowConfidenceReason}
                </p>
              </button>
            ))
          )}
        </div>

        <div className="rounded-xl border border-border/60 bg-card/40 p-5">
          {!selectedItem || !editForm ? (
            <p className="text-sm text-muted-foreground">
              Select a lead to review details and publish.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-semibold">{selectedItem.title}</h2>
                <a
                  href={selectedItem.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-xs text-muted-foreground hover:text-primary"
                >
                  {selectedItem.sourceUrl}
                </a>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Low confidence reason</p>
                <p className="mt-1">{selectedItem.lowConfidenceReason}</p>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-xs">
                <p className="font-medium text-muted-foreground">Raw summary</p>
                <p className="mt-2 max-h-32 overflow-y-auto leading-relaxed text-foreground/90">
                  {selectedItem.rawSummary}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-xs">
                  <span className="text-muted-foreground">Title</span>
                  <Input
                    value={editForm.matchName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, matchName: e.target.value })
                    }
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs">
                  <span className="text-muted-foreground">Category</span>
                  <select
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={editForm.accessType}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        accessType: e.target.value as AccessRecord["accessType"],
                      })
                    }
                  >
                    {ACCESS_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-xs">
                  <span className="text-muted-foreground">City</span>
                  <Input
                    value={editForm.city}
                    onChange={(e) =>
                      setEditForm({ ...editForm, city: e.target.value })
                    }
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs">
                  <span className="text-muted-foreground">Venue</span>
                  <Input
                    value={editForm.venue}
                    onChange={(e) =>
                      setEditForm({ ...editForm, venue: e.target.value })
                    }
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs">
                  <span className="text-muted-foreground">Date</span>
                  <Input
                    value={editForm.eventDate}
                    onChange={(e) =>
                      setEditForm({ ...editForm, eventDate: e.target.value })
                    }
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs">
                  <span className="text-muted-foreground">Match stage</span>
                  <select
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={editForm.matchStage}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        matchStage: e.target.value as AccessRecord["matchStage"],
                      })
                    }
                  >
                    {MATCH_STAGES.map((stage) => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-xs">
                  <span className="text-muted-foreground">Price min</span>
                  <Input
                    value={editForm.priceMin}
                    onChange={(e) =>
                      setEditForm({ ...editForm, priceMin: e.target.value })
                    }
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs">
                  <span className="text-muted-foreground">Price max</span>
                  <Input
                    value={editForm.priceMax}
                    onChange={(e) =>
                      setEditForm({ ...editForm, priceMax: e.target.value })
                    }
                  />
                </label>
              </div>

              <p className="text-xs text-muted-foreground">
                Extracted price:{" "}
                {formatPriceRange(
                  selectedItem.priceMin,
                  selectedItem.priceMax,
                  selectedItem.currency
                )}
              </p>

              <label className="flex flex-col gap-1 text-xs">
                <span className="text-muted-foreground">Summary</span>
                <textarea
                  className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={editForm.summary}
                  onChange={(e) =>
                    setEditForm({ ...editForm, summary: e.target.value })
                  }
                />
              </label>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  type="button"
                  onClick={() => runAction("approve")}
                  disabled={loading || selectedItem.status === "Approved"}
                >
                  Approve & Publish
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => runAction("update")}
                  disabled={loading}
                >
                  Save Draft
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => runAction("reject")}
                  disabled={loading || selectedItem.status === "Rejected"}
                >
                  Reject
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
