import { NextResponse } from "next/server";
import { isAuthorizedAdmin, unauthorizedResponse } from "@/lib/admin/auth";
import { loadReviewQueue, loadReviewQueueByStatus } from "@/lib/review-queue/store";
import type { ReviewStatus } from "@/lib/opportunities/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isAuthorizedAdmin(request)) {
    return unauthorizedResponse();
  }

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");
  const status =
    statusParam === "Needs Review" ||
    statusParam === "Approved" ||
    statusParam === "Rejected"
      ? (statusParam as ReviewStatus)
      : undefined;

  const items = await loadReviewQueueByStatus(status);
  const allItems = status ? await loadReviewQueue() : items;

  return NextResponse.json({
    items,
    counts: {
      needsReview: allItems.filter((i) => i.status === "Needs Review").length,
      approved: allItems.filter((i) => i.status === "Approved").length,
      rejected: allItems.filter((i) => i.status === "Rejected").length,
    },
  });
}
