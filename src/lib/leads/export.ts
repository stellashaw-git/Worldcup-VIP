import type { Lead } from "@/lib/leads/types";

export type LeadExportRow = {
  createdAt: string;
  type: string;
  email: string;
  name: string;
  organization: string;
  city: string;
  nycPlusInterest: string;
  recordTitle: string;
  recordId: string;
  message: string;
  listingTitle: string;
  listingType: string;
  eventDate: string;
  description: string;
  listingUrl: string;
  priceRange: string;
};

export const LEAD_EXPORT_HEADERS: (keyof LeadExportRow)[] = [
  "createdAt",
  "type",
  "email",
  "name",
  "organization",
  "city",
  "nycPlusInterest",
  "recordTitle",
  "recordId",
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
  organization: "Organization",
  city: "City",
  nycPlusInterest: "NYC Plus Interest",
  recordTitle: "Record Title",
  recordId: "Record ID",
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
    city: "",
    nycPlusInterest: "",
    recordTitle: "",
    recordId: "",
    message: "",
    listingTitle: "",
    listingType: "",
    eventDate: "",
    description: "",
    listingUrl: "",
    priceRange: "",
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

  // UTF-8 BOM helps Excel open encoding correctly on Windows.
  return `\uFEFF${headerLine}\n${rows.join("\n")}\n`;
}

export function buildExportFilename(extension: "csv" | "xlsx"): string {
  const date = new Date().toISOString().slice(0, 10);
  return `blackbook-leads-${date}.${extension}`;
}
