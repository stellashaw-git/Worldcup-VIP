import { NextResponse } from "next/server";
import { isAuthorizedAdmin, unauthorizedResponse } from "@/lib/admin/auth";
import { addLead, getLeadCounts, loadLeads } from "@/lib/leads/store";
import type { CreateLeadBody } from "@/lib/leads/types";
import { MEMBER_INTERESTS, MEMBER_ROLES, US_HOST_CITIES } from "@/lib/leads/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function GET(request: Request) {
  if (!isAuthorizedAdmin(request)) {
    return unauthorizedResponse();
  }

  const leads = await loadLeads();
  const counts = await getLeadCounts();
  return NextResponse.json({ leads, counts });
}

function isValidWebsite(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 4) return false;
  try {
    const url = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    const parsed = new URL(url);
    return parsed.hostname.includes(".");
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateLeadBody;

    if (!body.type) {
      return NextResponse.json({ error: "type is required" }, { status: 400 });
    }

    if (body.type === "platform-waitlist") {
      if (!body.email?.trim() || !isValidEmail(body.email)) {
        return NextResponse.json({ error: "Valid email required" }, { status: 400 });
      }
      if (!US_HOST_CITIES.includes(body.city)) {
        return NextResponse.json({ error: "Valid city required" }, { status: 400 });
      }
    }

    if (body.type === "access-request") {
      if (!body.email?.trim() || !isValidEmail(body.email)) {
        return NextResponse.json({ error: "Valid email required" }, { status: 400 });
      }
      if (!body.recordId || !body.recordTitle) {
        return NextResponse.json(
          { error: "recordId and recordTitle required" },
          { status: 400 }
        );
      }
    }

    if (body.type === "listing-submission") {
      if (
        !body.submitterName?.trim() ||
        !body.submitterEmail?.trim() ||
        !isValidEmail(body.submitterEmail) ||
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
    }

    if (body.type === "member-application") {
      if (
        !body.name?.trim() ||
        !body.email?.trim() ||
        !isValidEmail(body.email) ||
        !body.linkedin?.trim() ||
        !body.company?.trim() ||
        !body.website?.trim() ||
        !isValidWebsite(body.website) ||
        !MEMBER_ROLES.includes(body.role) ||
        !body.interests?.length
      ) {
        return NextResponse.json(
          {
            error:
              "Name, email, LinkedIn, company, website, role, and at least one interest required",
          },
          { status: 400 }
        );
      }
      const validInterests = body.interests.every((i) =>
        MEMBER_INTERESTS.includes(i)
      );
      if (!validInterests) {
        return NextResponse.json({ error: "Invalid interest selection" }, { status: 400 });
      }
    }

    if (body.type === "event-interest") {
      if (
        !body.email?.trim() ||
        !isValidEmail(body.email) ||
        !body.eventId?.trim() ||
        !body.eventTitle?.trim()
      ) {
        return NextResponse.json(
          { error: "Valid email, eventId, and eventTitle required" },
          { status: 400 }
        );
      }
    }

    const lead = await addLead(body);
    return NextResponse.json({ ok: true, lead });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
