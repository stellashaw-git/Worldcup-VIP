import type { AccessRecord } from "@/lib/opportunities/types";

export const DIRECTORY_FILTERS = [
  { id: "all", label: "All" },
  { id: "official", label: "Official Hubs" },
  { id: "host-city", label: "Host Cities" },
  { id: "travel", label: "Hotels & Travel" },
  { id: "final", label: "World Cup Final" },
] as const;

export type DirectoryFilterId = (typeof DIRECTORY_FILTERS)[number]["id"];

export function recordMatchesDirectoryFilter(
  record: AccessRecord,
  filter: DirectoryFilterId
): boolean {
  if (filter === "all") {
    return true;
  }

  if (filter === "official") {
    return (
      record.hospitalityCategory === "FIFA Hospitality" ||
      record.matchStageDetail === "Official FIFA Hub" ||
      record.matchStageDetail === "Official Travel Partner" ||
      record.sourceType === "Official FIFA Hospitality" ||
      record.sourceType === "Official FIFA"
    );
  }

  if (filter === "host-city") {
    return (
      record.matchStageDetail === "Host City Venue" ||
      (record.hospitalityCategory === "Official Venue" &&
        record.venue !== "Unknown")
    );
  }

  if (filter === "travel") {
    return (
      record.matchStageDetail === "Hotel & Stays" ||
      record.accessType === "Travel Package" ||
      record.sourceType === "Official On Location" ||
      record.matchStageDetail === "Official Travel Partner"
    );
  }

  if (filter === "final") {
    return (
      record.matchStage === "Final" ||
      (record.matchStageDetail?.toLowerCase().includes("final") ?? false)
    );
  }

  return true;
}

export function buildRecordSearchText(record: AccessRecord): string {
  return [
    record.matchName,
    record.matchStage,
    record.matchStageDetail,
    record.productName,
    record.city,
    record.venue,
    record.eventDate,
    record.accessType,
    record.hospitalityCategory,
    record.sourceName,
    record.sourceType,
    record.summary,
    record.capacity,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
