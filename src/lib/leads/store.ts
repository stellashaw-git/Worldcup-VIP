import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { getDataDir } from "@/lib/data-dir";
import type {
  CreateLeadBody,
  Lead,
  PlatformWaitlistLead,
} from "@/lib/leads/types";

const DATA_DIR = getDataDir();
const LEADS_FILE = path.join(DATA_DIR, "leads.json");

type LeadsFile = {
  leads: Lead[];
};

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readLeadsFile(): Promise<LeadsFile> {
  try {
    const raw = await fs.readFile(LEADS_FILE, "utf8");
    const parsed = JSON.parse(raw) as LeadsFile;
    return { leads: parsed.leads ?? [] };
  } catch {
    return { leads: [] };
  }
}

async function writeLeadsFile(data: LeadsFile) {
  await ensureDataDir();
  await fs.writeFile(LEADS_FILE, JSON.stringify(data, null, 2), "utf8");
}

export async function loadLeads(): Promise<Lead[]> {
  const data = await readLeadsFile();
  return data.leads.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addLead(body: CreateLeadBody): Promise<Lead> {
  const data = await readLeadsFile();
  const createdAt = new Date().toISOString();
  const id = randomUUID();

  let lead: Lead;

  switch (body.type) {
    case "platform-waitlist":
      lead = {
        id,
        type: "platform-waitlist",
        email: body.email.trim().toLowerCase(),
        city: body.city,
        nycPlusInterest: body.nycPlusInterest ?? body.city === "New York / NJ",
        createdAt,
      } satisfies PlatformWaitlistLead;
      break;
    case "access-request":
      lead = {
        id,
        type: "access-request",
        email: body.email.trim().toLowerCase(),
        recordId: body.recordId,
        recordTitle: body.recordTitle,
        city: body.city,
        message: body.message?.trim() || null,
        createdAt,
      };
      break;
    case "listing-submission":
      lead = {
        id,
        type: "listing-submission",
        submitterName: body.submitterName.trim(),
        submitterEmail: body.submitterEmail.trim().toLowerCase(),
        organization: body.organization?.trim() || null,
        listingTitle: body.listingTitle.trim(),
        listingType: body.listingType.trim(),
        city: body.city.trim(),
        eventDate: body.eventDate?.trim() || null,
        description: body.description.trim(),
        listingUrl: body.listingUrl?.trim() || null,
        priceRange: body.priceRange?.trim() || null,
        createdAt,
      };
      break;
    case "member-application":
      const websiteRaw = body.website.trim();
      const websiteNormalized = websiteRaw.startsWith("http")
        ? websiteRaw
        : `https://${websiteRaw}`;
      lead = {
        id,
        type: "member-application",
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        linkedin: body.linkedin.trim(),
        company: body.company.trim(),
        website: websiteNormalized,
        role: body.role,
        interests: body.interests,
        note: body.note?.trim() || null,
        createdAt,
      };
      break;
    case "event-interest":
      lead = {
        id,
        type: "event-interest",
        email: body.email.trim().toLowerCase(),
        eventId: body.eventId,
        eventTitle: body.eventTitle.trim(),
        name: body.name?.trim() || null,
        createdAt,
      };
      break;
    case "join-updates":
      lead = {
        id,
        type: "join-updates",
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        city: body.city.trim(),
        linkedin: body.linkedin?.trim() || null,
        createdAt,
      };
      break;
    default:
      throw new Error("Invalid lead type");
  }

  data.leads.push(lead);
  await writeLeadsFile(data);
  return lead;
}

export async function getLeadCounts() {
  const leads = await loadLeads();
  return {
    total: leads.length,
    platformWaitlist: leads.filter((l) => l.type === "platform-waitlist").length,
    accessRequest: leads.filter((l) => l.type === "access-request").length,
    listingSubmission: leads.filter((l) => l.type === "listing-submission").length,
    memberApplication: leads.filter((l) => l.type === "member-application").length,
    eventInterest: leads.filter((l) => l.type === "event-interest").length,
    joinUpdates: leads.filter((l) => l.type === "join-updates").length,
  };
}
