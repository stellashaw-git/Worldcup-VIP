import type { Lead } from "@/lib/leads/types";

export type LeadExportRow = {
  createdAt: string;
  type: string;
  email: string;
  name: string;
  organization: string;
  company: string;
  website: string;
  city: string;
  nycPlusInterest: string;
  linkedin: string;
  role: string;
  interests: string;
  note: string;
  recordTitle: string;
  recordId: string;
  message: string;
  listingTitle: string;
  listingType: string;
  eventDate: string;
  description: string;
  listingUrl: string;
  priceRange: string;
  eventId: string;
  eventTitle: string;
};

export const LEAD_EXPORT_HEADERS: (keyof LeadExportRow)[] = [
  "createdAt",
  "type",
  "email",
  "name",
  "linkedin",
  "role",
  "interests",
  "note",
  "company",
  "website",
  "organization",
  "city",
  "nycPlusInterest",
  "recordTitle",
  "recordId",
  "eventId",
  "eventTitle",
  "message",
  "listingTitle",
  "listingType",
  "eventDate",
  "description",
  "listingUrl",
  "priceRange",
];

export const LEAD_EXPORT_HEADER_LABELS: Record<keyof LeadExportRow, string> = {
  createdAt: "Created At",
  type: "Type",
  email: "Email",
  name: "Name",
  linkedin: "LinkedIn",
  role: "Role",
  interests: "Interests",
  note: "Note",
  company: "Company",
  website: "Website",
  organization: "Organization",
  city: "City",
  nycPlusInterest: "NYC Plus Interest",
  recordTitle: "Record Title",
  recordId: "Record ID",
  eventId: "Event ID",
  eventTitle: "Event Title",
  message: "Message",
  listingTitle: "Listing Title",
  listingType: "Listing Type",
  eventDate: "Event Date",
  description: "Description",
  listingUrl: "Listing URL",
  priceRange: "Price Range",
};

function emptyRow(): LeadExportRow {
  return {
    createdAt: "",
    type: "",
    email: "",
    name: "",
    organization: "",
    company: "",
    website: "",
    city: "",
    nycPlusInterest: "",
    linkedin: "",
    role: "",
    interests: "",
    note: "",
    recordTitle: "",
    recordId: "",
    message: "",
    listingTitle: "",
    listingType: "",
    eventDate: "",
    description: "",
    listingUrl: "",
    priceRange: "",
    eventId: "",
    eventTitle: "",
  };
}

export function leadToExportRow(lead: Lead): LeadExportRow {
  const row = emptyRow();
  row.createdAt = new Date(lead.createdAt).toISOString();
  row.type = lead.type;

  switch (lead.type) {
    case "platform-waitlist":
      row.email = lead.email;
      row.city = lead.city;
      row.nycPlusInterest = lead.nycPlusInterest ? "Yes" : "No";
      break;
    case "access-request":
      row.email = lead.email;
      row.city = lead.city;
      row.recordTitle = lead.recordTitle;
      row.recordId = lead.recordId;
      row.message = lead.message ?? "";
      break;
    case "listing-submission":
      row.email = lead.submitterEmail;
      row.name = lead.submitterName;
      row.organization = lead.organization ?? "";
      row.city = lead.city;
      row.listingTitle = lead.listingTitle;
      row.listingType = lead.listingType;
      row.eventDate = lead.eventDate ?? "";
      row.description = lead.description;
      row.listingUrl = lead.listingUrl ?? "";
      row.priceRange = lead.priceRange ?? "";
      break;
    case "member-application":
      row.email = lead.email;
      row.name = lead.name;
      row.linkedin = lead.linkedin;
      row.company = lead.company;
      row.website = lead.website;
      row.role = lead.role;
      row.interests = lead.interests.join("; ");
      row.note = lead.note ?? "";
      row.city = "New York";
      break;
    case "event-interest":
      row.email = lead.email;
      row.name = lead.name ?? "";
      row.eventId = lead.eventId;
      row.eventTitle = lead.eventTitle;
      row.city = "New York";
      break;
  }

  return row;
}

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildLeadsCsv(leads: Lead[]): string {
  const headerLine = LEAD_EXPORT_HEADERS
    .map((key) => escapeCsvCell(LEAD_EXPORT_HEADER_LABELS[key]))
    .join(",");

  const rows = leads.map((lead) => {
    const row = leadToExportRow(lead);
    return LEAD_EXPORT_HEADERS
      .map((key) => escapeCsvCell(row[key]))
      .join(",");
  });

  return `\uFEFF${headerLine}\n${rows.join("\n")}\n`;
}

export function buildExportFilename(extension: "csv" | "xlsx"): string {
  const date = new Date().toISOString().slice(0, 10);
  return `blackbook-leads-${date}.${extension}`;
}
