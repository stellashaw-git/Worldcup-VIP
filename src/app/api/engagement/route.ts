import { NextResponse } from "next/server";
import { computeMarketInsights } from "@/lib/engagement/analytics";
import {
  getEngagementStore,
  getRecordEngagementMap,
  trackEngagement,
} from "@/lib/engagement/store";
import type {
  EngagementPostBody,
  MarketInsights,
} from "@/lib/engagement/types";
import { getDirectoryCache, setDirectoryCache } from "@/lib/opportunities/cache";
import {
  computeDirectoryMetrics,
  groupRecords,
} from "@/lib/opportunities/group";
import { mergeStarterRecords } from "@/lib/opportunities/starter-directory";
import type { AccessRecord } from "@/lib/opportunities/types";
import { mergePublicRecords } from "@/lib/review-queue/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function getRecordsForInsights(): Promise<AccessRecord[]> {
  const cached = getDirectoryCache();
  if (cached.records.length > 0) {
    return cached.records;
  }

  const approved = await mergePublicRecords([]);
  const records = mergeStarterRecords(approved);
  if (records.length === 0) {
    return records;
  }

  const groupedEvents = groupRecords(records);
  const metrics = computeDirectoryMetrics(records);
  setDirectoryCache({ records, groupedEvents, metrics });
  return records;
}

export async function GET() {
  const records = await getRecordsForInsights();
  const engagement = getRecordEngagementMap();
  const store = getEngagementStore();
  const insights = computeMarketInsights(records, store, engagement);

  return NextResponse.json<MarketInsights>(insights);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EngagementPostBody;

    if (!body.recordId || !body.action) {
      return NextResponse.json(
        { error: "recordId and action are required" },
        { status: 400 }
      );
    }

    trackEngagement(body.action, body.recordId, body.meta);

    const records = await getRecordsForInsights();
    const engagement = getRecordEngagementMap();
    const store = getEngagementStore();
    const insights = computeMarketInsights(records, store, engagement);

    return NextResponse.json({
      ok: true,
      recordEngagement: engagement[body.recordId],
      insights,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
