import { promises as fs } from "fs";
import path from "path";
import { getDataDir } from "@/lib/data-dir";
import { getDirectoryCache } from "@/lib/opportunities/cache";
import type { AccessRecord, ReviewQueueItem, ReviewStatus } from "@/lib/opportunities/types";
import { reviewItemToAccessRecord } from "@/lib/opportunities/quality";

const DATA_DIR = getDataDir();
const QUEUE_FILE = path.join(DATA_DIR, "review-queue.json");

type QueueFile = {
  items: ReviewQueueItem[];
};

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readQueueFile(): Promise<QueueFile> {
  try {
    const raw = await fs.readFile(QUEUE_FILE, "utf8");
    const parsed = JSON.parse(raw) as QueueFile;
    return { items: parsed.items ?? [] };
  } catch {
    return { items: [] };
  }
}

async function writeQueueFile(data: QueueFile) {
  await ensureDataDir();
  await fs.writeFile(QUEUE_FILE, JSON.stringify(data, null, 2), "utf8");
}

export async function loadReviewQueue(): Promise<ReviewQueueItem[]> {
  const data = await readQueueFile();
  return data.items;
}

export async function loadReviewQueueByStatus(
  status?: ReviewStatus
): Promise<ReviewQueueItem[]> {
  const items = await loadReviewQueue();
  if (!status) return items;
  return items.filter((item) => item.status === status);
}

export async function getReviewQueueItem(id: string): Promise<ReviewQueueItem | null> {
  const items = await loadReviewQueue();
  return items.find((item) => item.id === id) ?? null;
}

export async function upsertReviewQueueItems(
  incoming: ReviewQueueItem[]
): Promise<ReviewQueueItem[]> {
  const data = await readQueueFile();
  const byUrl = new Map(data.items.map((item) => [item.sourceUrl, item]));

  for (const item of incoming) {
    const existing = byUrl.get(item.sourceUrl);
    if (existing) {
      if (existing.status === "Approved" || existing.status === "Rejected") {
        continue;
      }
      byUrl.set(item.sourceUrl, {
        ...item,
        id: existing.id,
        status: "Needs Review",
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString(),
      });
    } else {
      byUrl.set(item.sourceUrl, item);
    }
  }

  const items = Array.from(byUrl.values()).sort(
    (a, b) => b.updatedAt.localeCompare(a.updatedAt)
  );
  await writeQueueFile({ items });
  return items;
}

export async function updateReviewQueueItem(
  id: string,
  patch: Partial<ReviewQueueItem> & {
    recordEdits?: Partial<AccessRecord>;
  }
): Promise<ReviewQueueItem | null> {
  const data = await readQueueFile();
  const index = data.items.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const current = data.items[index];
  const recordDraft = patch.recordEdits
    ? { ...current.recordDraft, ...patch.recordEdits }
    : current.recordDraft;

  const updated: ReviewQueueItem = {
    ...current,
    ...patch,
    recordDraft,
    updatedAt: new Date().toISOString(),
  };

  if (patch.recordEdits?.matchName) {
    updated.title = patch.recordEdits.matchName;
  }

  data.items[index] = updated;
  await writeQueueFile(data);
  return updated;
}

export async function approveReviewQueueItem(
  id: string,
  edits?: Partial<AccessRecord>
): Promise<{ item: ReviewQueueItem; record: AccessRecord } | null> {
  const item = await getReviewQueueItem(id);
  if (!item) return null;

  const record = reviewItemToAccessRecord(item, edits);
  const updated = await updateReviewQueueItem(id, {
    status: "Approved",
    title: record.matchName,
    category: record.accessType,
    city: record.city !== "Unknown" ? record.city : null,
    venue: record.venue !== "Unknown" ? record.venue : null,
    eventDate: record.eventDate !== "Unknown" ? record.eventDate : null,
    priceMin: record.priceMin,
    priceMax: record.priceMax,
    currency: record.currency,
    confidenceScore: record.confidenceScore,
    recordEdits: record,
  });

  if (!updated) return null;
  return { item: updated, record };
}

export async function rejectReviewQueueItem(id: string): Promise<ReviewQueueItem | null> {
  return updateReviewQueueItem(id, { status: "Rejected" });
}

export async function getApprovedAccessRecords(): Promise<AccessRecord[]> {
  const items = await loadReviewQueueByStatus("Approved");
  return items.map((item) => reviewItemToAccessRecord(item));
}

export function dedupePublicRecords(records: AccessRecord[]): AccessRecord[] {
  const byUrl = new Map<string, AccessRecord>();
  for (const record of records) {
    byUrl.set(record.sourceUrl, record);
  }
  return Array.from(byUrl.values());
}

export async function mergePublicRecords(
  newAutoPublic?: AccessRecord[]
): Promise<AccessRecord[]> {
  const approved = await getApprovedAccessRecords();
  const approvedUrls = new Set(approved.map((record) => record.sourceUrl));

  let autoPublic: AccessRecord[] = [];
  if (newAutoPublic) {
    autoPublic = newAutoPublic;
  } else {
    const { records } = getDirectoryCache();
    autoPublic = records.filter((record) => !approvedUrls.has(record.sourceUrl));
  }

  return dedupePublicRecords([...autoPublic, ...approved]);
}
