import { NextResponse } from "next/server";
import { isAuthorizedAdmin, unauthorizedResponse } from "@/lib/admin/auth";
import { setDirectoryCache } from "@/lib/opportunities/cache";
import {
  computeDirectoryMetrics,
  groupRecords,
} from "@/lib/opportunities/group";
import {
  approveReviewQueueItem,
  mergePublicRecords,
  rejectReviewQueueItem,
  updateReviewQueueItem,
} from "@/lib/review-queue/store";
import type { AccessRecord } from "@/lib/opportunities/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

async function refreshDirectoryCache(autoPublic: AccessRecord[] = []) {
  const records = await mergePublicRecords(autoPublic);
  const groupedEvents = groupRecords(records);
  const metrics = computeDirectoryMetrics(records);
  setDirectoryCache({ records, groupedEvents, metrics });
  return records;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  if (!isAuthorizedAdmin(request)) {
    return unauthorizedResponse();
  }

  const { id } = await params;

  try {
    const body = (await request.json()) as {
      action?: "approve" | "reject" | "update";
      edits?: Partial<AccessRecord>;
      title?: string;
    };

    if (body.action === "reject") {
      const item = await rejectReviewQueueItem(id);
      if (!item) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
      }
      await refreshDirectoryCache();
      return NextResponse.json({ item });
    }

    if (body.action === "approve") {
      const result = await approveReviewQueueItem(id, body.edits);
      if (!result) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
      }
      const records = await refreshDirectoryCache();
      return NextResponse.json({
        item: result.item,
        record: result.record,
        publicCount: records.length,
      });
    }

    if (body.action === "update") {
      const patch: Parameters<typeof updateReviewQueueItem>[1] = {
        recordEdits: body.edits,
      };
      if (body.title) {
        patch.title = body.title;
      }
      const item = await updateReviewQueueItem(id, patch);
      if (!item) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
      }
      return NextResponse.json({ item });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function GET(request: Request, { params }: RouteParams) {
  if (!isAuthorizedAdmin(request)) {
    return unauthorizedResponse();
  }

  const { id } = await params;
  const { getReviewQueueItem } = await import("@/lib/review-queue/store");
  const item = await getReviewQueueItem(id);

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  return NextResponse.json({ item });
}
