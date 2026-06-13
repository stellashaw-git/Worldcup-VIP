import type {
  AccessRecord,
  AccessType,
  HospitalityCategory,
  MatchStage,
  SourceType,
} from "@/lib/opportunities/types";

type OfficialInference = Pick<
  AccessRecord,
  "matchStage" | "matchStageDetail" | "accessType" | "hospitalityCategory"
>;

function urlLower(url: string): string {
  return url.toLowerCase();
}

export function inferOfficialMetadata(
  sourceUrl: string,
  sourceType: SourceType,
  sourceName: string
): OfficialInference | null {
  const url = urlLower(sourceUrl);
  const name = sourceName.toLowerCase();

  if (
    sourceType === "Official FIFA Hospitality" ||
    sourceType === "Official FIFA" ||
    url.includes("fifa.com") ||
    url.includes("hospitality.fifa")
  ) {
    return {
      matchStage: "Group Stage",
      matchStageDetail: "Official FIFA Hub",
      accessType: "Hospitality Package",
      hospitalityCategory: "FIFA Hospitality",
    };
  }

  if (
    sourceType === "Official On Location" ||
    url.includes("onlocation")
  ) {
    return {
      matchStage: "Group Stage",
      matchStageDetail: "Official Travel Partner",
      accessType: "Travel Package",
      hospitalityCategory: "Travel Partner",
    };
  }

  if (
    sourceType === "Hospitality Company" ||
    name.includes("marriott") ||
    name.includes("hilton") ||
    name.includes("hyatt")
  ) {
    return {
      matchStage: "Group Stage",
      matchStageDetail: "Hotel & Stays",
      accessType: "Travel Package",
      hospitalityCategory: "Travel Partner",
    };
  }

  if (sourceType === "Official Venue" || url.includes("stadium")) {
    const isFinalVenue =
      url.includes("metlife") ||
      name.includes("metlife") ||
      url.includes("world-cup-26") ||
      url.includes("world-cup-2026");

    return {
      matchStage: isFinalVenue ? "Final" : "Group Stage",
      matchStageDetail: isFinalVenue
        ? "World Cup Final Venue"
        : "Host City Venue",
      accessType: "Hospitality Package",
      hospitalityCategory: "Official Venue",
    };
  }

  if (sourceType === "Official Partner") {
    return {
      matchStage: "Group Stage",
      matchStageDetail: "Curated Listing",
      accessType: "VIP Experience",
      hospitalityCategory: "Official Venue",
    };
  }

  if (sourceType === "Travel Partner") {
    return {
      matchStage: "Group Stage",
      matchStageDetail: "Travel Package",
      accessType: "Travel Package",
      hospitalityCategory: "Travel Partner",
    };
  }

  if (sourceType === "Premium Ticket Provider") {
    return {
      matchStage: "Group Stage",
      matchStageDetail: "Ticket Marketplace",
      accessType: "Club Seat",
      hospitalityCategory: "Broker / Reseller",
    };
  }

  return null;
}

export function applyOfficialInference(
  record: AccessRecord
): AccessRecord {
  const inferred = inferOfficialMetadata(
    record.sourceUrl,
    record.sourceType,
    record.sourceName
  );
  if (!inferred) return record;

  return {
    ...record,
    matchStage:
      record.matchStage === "Unknown"
        ? inferred.matchStage
        : record.matchStage,
    matchStageDetail:
      record.matchStageDetail ?? inferred.matchStageDetail,
    accessType:
      record.accessType === "Unknown" ? inferred.accessType : record.accessType,
    hospitalityCategory:
      record.hospitalityCategory === "Unknown"
        ? inferred.hospitalityCategory
        : record.hospitalityCategory,
  };
}

export function getStageBadgeLabel(record: AccessRecord): string | null {
  if (record.matchStageDetail?.trim()) {
    return record.matchStageDetail;
  }
  if (record.matchStage !== "Unknown") {
    return record.matchStage;
  }
  if (record.hospitalityCategory !== "Unknown") {
    return record.hospitalityCategory;
  }
  if (record.accessType !== "Unknown") {
    return record.accessType;
  }
  return null;
}

export function formatHospitalityCategory(
  category: HospitalityCategory
): string {
  if (category === "Unknown") return "Unknown";
  if (category === "Broker / Reseller") return "Broker / Reseller";
  return category;
}
