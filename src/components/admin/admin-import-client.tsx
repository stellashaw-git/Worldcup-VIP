"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FIFA_CHOOSE_MATCHES_URL } from "@/lib/official-sources/types";

const EXAMPLE_TEXT = `France vs Senegal
Group I
June 16 Tuesday, 3:00 pm ET
East Rutherford, United States
New York/New Jersey Stadium
Starting at $2,958 USD/pp`;

export function AdminImportClient() {
  const [text, setText] = useState("");
  const [source, setSource] = useState<"fifa" | "onlocation">("fifa");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  async function handleImport(publish: boolean) {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = sessionStorage.getItem("blackbook_admin_token") ?? "";
      const response = await fetch("/api/official-sources/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ text, source, publish }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Import failed");
      }

      setResult(
        publish
          ? `Published ${data.imported} official records. Public directory: ${data.publicCount}.`
          : `Parsed ${data.imported} records (preview only).`
      );
    } catch (importError) {
      setError(
        importError instanceof Error ? importError.message : "Import failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
          Admin
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Import Official Listings
        </h1>
        <p className="text-sm text-muted-foreground">
          Paste match cards copied from{" "}
          <a
            href={FIFA_CHOOSE_MATCHES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            FIFA Hospitality
          </a>{" "}
          or On Location when browser scraping is blocked.
        </p>
      </div>

      <div className="mb-4 flex gap-2">
        <Button
          type="button"
          size="sm"
          variant={source === "fifa" ? "default" : "outline"}
          onClick={() => setSource("fifa")}
        >
          FIFA Hospitality
        </Button>
        <Button
          type="button"
          size="sm"
          variant={source === "onlocation" ? "default" : "outline"}
          onClick={() => setSource("onlocation")}
        >
          On Location
        </Button>
        <Link href="/admin/review" className="ml-auto text-sm text-muted-foreground hover:text-primary">
          Review queue →
        </Link>
        <Link href="/admin/import" className="text-sm text-muted-foreground hover:text-primary">
          Import listings →
        </Link>
      </div>

      <textarea
        className="min-h-64 w-full rounded-xl border border-border/60 bg-card/40 px-4 py-3 text-sm"
        placeholder={EXAMPLE_TEXT}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <details className="mt-3 text-xs text-muted-foreground">
        <summary className="cursor-pointer">Example format</summary>
        <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-muted/20 p-3">
          {EXAMPLE_TEXT}
        </pre>
      </details>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" disabled={loading} onClick={() => handleImport(true)}>
          {loading ? "Importing..." : "Parse & Publish"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={() => handleImport(false)}
        >
          Preview Parse
        </Button>
      </div>

      {result && (
        <p className="mt-4 text-sm text-primary">{result}</p>
      )}
      {error && (
        <p className="mt-4 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
