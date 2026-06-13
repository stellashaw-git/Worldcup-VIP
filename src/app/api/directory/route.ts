import { NextResponse } from "next/server";
import {
  computeDirectoryMetrics,
  groupRecords,
} from "@/lib/opportunities/group";
import { setDirectoryCache } from "@/lib/opportunities/cache";
import { mergeStarterRecords } from "@/lib/opportunities/starter-directory";
import type { SearchOpportunitiesResponse } from "@/lib/opportunities/types";
import { mergePublicRecords } from "@/lib/review-queue/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const approved = await mergePublicRecords([]);
  const records = mergeStarterRecords(approved);
  const groupedEvents = groupRecords(records);
  const metrics = computeDirectoryMetrics(records);

  setDirectoryCache({ records, groupedEvents, metrics });

  const response: SearchOpportunitiesResponse = {
    records,
    groupedEvents,
    metrics,
    message:
      records.length > 0
        ? "Starter directory loaded. Use Refresh for live official scrape + discovery."
        : undefined,
  };

  return NextResponse.json(response);
}
