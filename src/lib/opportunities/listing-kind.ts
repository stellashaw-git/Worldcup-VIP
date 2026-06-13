import type { AccessRecord, ListingKind } from "@/lib/opportunities/types";

export function inferListingKind(
  record: Pick<
    AccessRecord,
    | "matchStageDetail"
    | "venue"
    | "city"
    | "accessType"
    | "matchName"
    | "productName"
    | "hospitalityProduct"
    | "sourceType"
    | "listingKind"
  >
): ListingKind {
  if (record.listingKind && record.listingKind !== "unknown") {
    return record.listingKind;
  }

  if (record.productName?.trim() || record.hospitalityProduct?.trim()) {
    return "hospitality_product";
  }

  if (
    record.matchStageDetail === "Official FIFA Hub" ||
    (record.matchStageDetail === "Official Travel Partner" &&
      record.venue === "Unknown")
  ) {
    return "official_hub";
  }

  if (
    record.matchStageDetail === "Hotel & Stays" ||
    (record.accessType === "Travel Package" && record.venue === "Unknown")
  ) {
    return "travel_bundle";
  }

  if (record.accessType === "Private Event") {
    return "private_experience";
  }

  if (record.venue !== "Unknown") {
    const name = record.matchName.toLowerCase();
    const venue = record.venue.toLowerCase();
    if (
      name.includes(venue.replace(/ stadium$/, "")) ||
      name.includes("hospitality") &&
        record.accessType === "Hospitality Package"
    ) {
      return "venue_portal";
    }
    return "hospitality_product";
  }

  if (
    record.sourceType === "Official FIFA Hospitality" ||
    record.sourceType === "Official FIFA" ||
    record.sourceType === "Official On Location"
  ) {
    return "official_hub";
  }

  return "unknown";
}

export function applyListingKind(record: AccessRecord): AccessRecord {
  return {
    ...record,
    listingKind: inferListingKind(record),
  };
}

export function formatListingKind(kind: ListingKind): string {
  switch (kind) {
    case "official_hub":
      return "Official hub";
    case "venue_portal":
      return "Stadium";
    case "hospitality_product":
      return "Package";
    case "travel_bundle":
      return "Travel & stays";
    case "private_experience":
      return "Private experience";
    default:
      return "Listing";
  }
}
