import { mergeStarterRecords } from "@/lib/opportunities/starter-directory";
import type { AccessRecord } from "@/lib/opportunities/types";
import { mergePublicRecords } from "@/lib/review-queue/store";

export async function getPublicDirectoryRecords(): Promise<AccessRecord[]> {
  const approved = await mergePublicRecords([]);
  return mergeStarterRecords(approved);
}
