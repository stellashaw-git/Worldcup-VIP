"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import type { DebugFifaExtractionResult } from "@/lib/official-sources/debug-fifa";
import { FIFA_CHOOSE_MATCHES_URL } from "@/lib/official-sources/types";

const FETCH_TIMEOUT_MS = 120_000;

export function DebugOfficialClient() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [result, setResult] = useState<DebugFifaExtractionResult | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const runExtraction = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    setResult(null);
    setStatus("Starting Playwright (may take 30–90 seconds)...");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch("/api/debug-official", {
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const data = (await response.json()) as DebugFifaExtractionResult;

      if (!response.ok && !data.error) {
        throw new Error(`Request failed (${response.status})`);
      }

      setResult(data);

      if (!data.ok && data.error) {
        setFetchError(data.error);
      }
    } catch (error) {
      clearTimeout(timeout);
      if (error instanceof Error && error.name === "AbortError") {
        setFetchError(
          "Request timed out after 2 minutes. The FIFA page may be slow or Playwright is stuck — check the terminal for [BLACKBOOK] Debug logs."
        );
      } else {
        setFetchError(
          error instanceof Error ? error.message : "Failed to run extraction"
        );
      }
    } finally {
      setLoading(false);
      setStatus(null);
    }
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
          Debug
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Official FIFA Extraction
        </h1>
        <p className="text-sm text-muted-foreground">
          Playwright test only — nothing is saved to the database. First run can
          take up to 90 seconds while the browser loads the FIFA page.
        </p>
        <a
          href={FIFA_CHOOSE_MATCHES_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-primary"
        >
          {FIFA_CHOOSE_MATCHES_URL}
        </a>
      </div>

      <Button type="button" onClick={runExtraction} disabled={loading}>
        {loading ? "Running Playwright..." : "Run FIFA extraction (first 10 cards)"}
      </Button>

      {loading && status && (
        <p className="mt-4 text-sm text-muted-foreground animate-pulse">{status}</p>
      )}

      {fetchError && (
        <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-4 text-sm text-destructive">
          <p className="font-medium">Error</p>
          <pre className="mt-2 whitespace-pre-wrap font-mono text-xs">{fetchError}</pre>
        </div>
      )}

      {result?.ok && (
        <div className="mt-8 flex flex-col gap-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Total cards found" value={result.totalCardsFound} />
            <Stat label="Total cards parsed" value={result.totalCardsParsed} />
            <Stat label="Total cards rejected" value={result.totalCardsRejected} />
          </div>

          {result.durationMs !== undefined && (
            <p className="text-xs text-muted-foreground">
              Completed in {(result.durationMs / 1000).toFixed(1)}s
              {result.bodyTextLength !== undefined &&
                ` · body text ${result.bodyTextLength.toLocaleString()} chars`}
            </p>
          )}

          {result.pageTitle && (
            <p className="text-xs text-muted-foreground">
              Page title: {result.pageTitle}
            </p>
          )}

          <p className="text-sm text-muted-foreground">
            Showing first {result.limitedTo} of {result.totalCardsFound} cards
          </p>

          <div className="flex flex-col gap-4">
            {result.cards.map((card) => (
              <div
                key={card.index}
                className="rounded-xl border border-border/60 bg-card/40 p-5"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Card {card.index}
                  </p>
                  <span
                    className={`text-xs font-medium ${
                      card.parsed ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {card.parsed ? "Parsed" : "Rejected"}
                  </span>
                </div>

                {card.parsed && card.displayLines.length > 0 && (
                  <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Parsed preview
                    </p>
                    {card.displayLines.map((line) => (
                      <p key={line} className="text-sm font-medium leading-relaxed">
                        {line}
                      </p>
                    ))}
                  </div>
                )}

                {card.rejectReason && (
                  <p className="mb-3 text-xs text-destructive">{card.rejectReason}</p>
                )}

                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    Raw card text
                  </summary>
                  <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-muted/20 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-foreground/90">
                    {card.rawText}
                  </pre>
                </details>

                {card.parsed && (
                  <details className="mt-2 text-xs">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      Parsed JSON
                    </summary>
                    <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-muted/20 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                      {JSON.stringify(card.parsed, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>

          {result.cards.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No match cards detected. The page may require login, block bots, or
              changed structure. Try pasting listings at{" "}
              <a href="/admin/import" className="text-primary hover:underline">
                /admin/import
              </a>
              .
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
