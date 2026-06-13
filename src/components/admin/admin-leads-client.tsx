"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { buildExportFilename } from "@/lib/leads/export";
import type { Lead } from "@/lib/leads/types";

type LeadsResponse = {
  leads: Lead[];
  counts: {
    total: number;
    platformWaitlist: number;
    accessRequest: number;
    listingSubmission: number;
  };
};

export function AdminLeadsClient() {
  const [data, setData] = useState<LeadsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [secret, setSecret] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const fetchLeads = useCallback(async (adminSecret: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/leads", {
        headers: { Authorization: `Bearer ${adminSecret}` },
      });
      if (!response.ok) {
        setError("Unauthorized or failed to load leads.");
        return;
      }
      setData(await response.json());
    } catch {
      setError("Network error.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      fetchLeads("");
    }
  }, [fetchLeads]);

  function handleAuthSubmit(event: React.FormEvent) {
    event.preventDefault();
    fetchLeads(secret);
  }

  async function handleDownloadExcel() {
    setIsExporting(true);
    setError(null);
    try {
      const response = await fetch("/api/leads/export", {
        headers: { Authorization: `Bearer ${secret}` },
      });
      if (!response.ok) {
        setError("Export failed. Check admin secret and try again.");
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = buildExportFilename("csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("Export failed. Network error.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Leads inbox</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Waitlist signups, access requests, and listing submissions. Download
            as Excel-compatible CSV for Mailchimp, Klaviyo, or spreadsheets.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleDownloadExcel}
            disabled={isExporting}
          >
            <Download className="size-4" aria-hidden />
            {isExporting ? "Downloading…" : "Download Excel"}
          </Button>
          <Link
            href="/admin/review"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Review queue
          </Link>
          <Link
            href="/admin/import"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Import official
          </Link>
        </div>
      </div>

      {process.env.NODE_ENV !== "development" && (
        <form
          onSubmit={handleAuthSubmit}
          className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Admin secret</span>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3"
            />
          </label>
          <Button type="submit" disabled={isLoading}>
            Load leads
          </Button>
        </form>
      )}

      {error && (
        <p className="mb-6 text-sm text-destructive">{error}</p>
      )}

      {data && (
        <>
          <div className="mb-6 flex flex-wrap gap-4 text-sm">
            <span>Total: {data.counts.total}</span>
            <span>Waitlist: {data.counts.platformWaitlist}</span>
            <span>Access requests: {data.counts.accessRequest}</span>
            <span>Listing submissions: {data.counts.listingSubmission}</span>
          </div>

          {data.leads.length === 0 && (
            <p className="mb-6 text-sm text-muted-foreground">
              No leads yet. Share the waitlist link:{" "}
              <code className="text-xs">/#waitlist</code>
            </p>
          )}

          <div className="overflow-hidden rounded-xl border border-border/60">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody>
                {data.leads.map((lead) => (
                  <tr key={lead.id} className="border-t border-border/60 align-top">
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(lead.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">{lead.type}</td>
                    <td className="px-4 py-3">
                      {lead.type === "platform-waitlist" && lead.email}
                      {lead.type === "access-request" && lead.email}
                      {lead.type === "listing-submission" && (
                        <>
                          {lead.submitterName}
                          <br />
                          <span className="text-muted-foreground">
                            {lead.submitterEmail}
                          </span>
                        </>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {lead.type === "platform-waitlist" && (
                        <>
                          {lead.city}
                          {lead.nycPlusInterest && " · NYC+ interest"}
                        </>
                      )}
                      {lead.type === "access-request" && (
                        <>
                          {lead.recordTitle}
                          {lead.message && ` — ${lead.message}`}
                        </>
                      )}
                      {lead.type === "listing-submission" && (
                        <>
                          <strong className="text-foreground">
                            {lead.listingTitle}
                          </strong>
                          <br />
                          {lead.listingType} · {lead.city}
                          {lead.priceRange && ` · ${lead.priceRange}`}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
