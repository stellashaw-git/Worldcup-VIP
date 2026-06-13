import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { addLead } from "@/lib/leads/store";
import { buildGroupKey } from "@/lib/opportunities/extract";
import type {
  AccessRecord,
  AccessType,
  ReviewQueueItem,
} from "@/lib/opportunities/types";
import { upsertReviewQueueItems } from "@/lib/review-queue/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SubmitListingBody = {
  submitterName: string;
  submitterEmail: string;
  organization?: string;
  listingTitle: string;
  listingType: string;
  city: string;
  eventDate?: string;
  description: string;
  listingUrl?: string;
  priceRange?: string;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

function mapListingType(type: string): AccessType {
  const normalized = type.toLowerCase();
  if (normalized.includes("suite")) return "Suite";
  if (normalized.includes("lounge")) return "Lounge";
  if (normalized.includes("watch")) return "Private Event";
  if (normalized.includes("dinner") || normalized.includes("private")) {
    return "Private Event";
  }
  if (normalized.includes("travel") || normalized.includes("hotel")) {
    return "Travel Package";
  }
  if (normalized.includes("hospitality")) return "Hospitality Package";
  return "VIP Experience";
}

function submissionToReviewItem(body: SubmitListingBody): ReviewQueueItem {
  const now = new Date().toISOString();
  const sourceUrl =
    body.listingUrl?.trim() ||
    `submission://${createHash("sha256")
      .update(`${body.submitterEmail}|${body.listingTitle}|${now}`)
      .digest("hex")
      .slice(0, 16)}`;

  const accessType = mapListingType(body.listingType);
  const city = body.city.trim();
  const eventDate = body.eventDate?.trim() || "Unknown";
  const venue = "Unknown";
  const matchName = body.listingTitle.trim();
  const id = createHash("sha256").update(sourceUrl).digest("hex").slice(0, 12);
  const slug = `${slugify(matchName)}-${id}`;
  const groupKey = buildGroupKey(matchName, venue, eventDate) || `submission-${id}`;

  const recordDraft: AccessRecord = {
    id,
    slug,
    groupKey,
    matchName,
    matchStage: "Unknown",
    city,
    venue,
    eventDate,
    accessType,
    hospitalityCategory: "Unknown",
    capacity: "Unknown",
    priceMin: null,
    priceMax: null,
    currency: "USD",
    availability: "Inquiry Required",
    sourceName: body.organization?.trim() || body.submitterName.trim(),
    sourceType: "Official Partner",
    sourceUrl,
    lastUpdated: now,
    summary: body.description.trim(),
    confidenceScore: 75,
    actionLabel: body.listingUrl ? "View listing" : undefined,
  };

  return {
    id: `rq-${id}`,
    status: "Needs Review",
    title: matchName,
    sourceUrl,
    sourceName: body.organization?.trim() || body.submitterName.trim(),
    category: accessType,
    city,
    venue: null,
    eventDate: body.eventDate?.trim() || null,
    priceMin: null,
    priceMax: null,
    currency: "USD",
    lowConfidenceReason: "Host submission — pending editorial review",
    rawSummary: body.description.trim(),
    confidenceScore: 75,
    sourceType: "Official Partner",
    recordDraft,
    createdAt: now,
    updatedAt: now,
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubmitListingBody;

    if (
      !body.submitterName?.trim() ||
      !body.submitterEmail?.trim() ||
      !body.listingTitle?.trim() ||
      !body.listingType?.trim() ||
      !body.city?.trim() ||
      !body.description?.trim()
    ) {
      return NextResponse.json(
        { error: "Name, email, title, type, city, and description required" },
        { status: 400 }
      );
    }

    const item = submissionToReviewItem(body);
    await upsertReviewQueueItems([item]);
    await addLead({
      type: "listing-submission",
      submitterName: body.submitterName,
      submitterEmail: body.submitterEmail,
      organization: body.organization,
      listingTitle: body.listingTitle,
      listingType: body.listingType,
      city: body.city,
      eventDate: body.eventDate,
      description: body.description,
      listingUrl: body.listingUrl,
      priceRange: body.priceRange,
    });

    return NextResponse.json({
      ok: true,
      reviewQueueId: item.id,
      message: "Submission received. Our team will review before publishing.",
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
