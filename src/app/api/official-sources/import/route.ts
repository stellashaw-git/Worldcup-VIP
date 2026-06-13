import { NextResponse } from "next/server";
import { isAuthorizedAdmin, unauthorizedResponse } from "@/lib/admin/auth";
import { getDirectoryCache, setDirectoryCache } from "@/lib/opportunities/cache";
import {
  computeDirectoryMetrics,
  groupRecords,
} from "@/lib/opportunities/group";
import { mergeOfficialAndDiscovered } from "@/lib/opportunities/official-quality";
import type { SourceType } from "@/lib/opportunities/types";
import { parsePastedOfficialText } from "@/lib/official-sources/run";
import { FIFA_CHOOSE_MATCHES_URL } from "@/lib/official-sources/types";
import { mergePublicRecords } from "@/lib/review-queue/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SOURCE_DEFAULTS: Record<
  string,
  { sourceName: string; sourceType: SourceType; sourceUrl: string }
> = {
  fifa: {
    sourceName: "FIFA Hospitality",
    sourceType: "Official FIFA Hospitality",
    sourceUrl: FIFA_CHOOSE_MATCHES_URL,
  },
  onlocation: {
    sourceName: "On Location",
    sourceType: "Official On Location",
    sourceUrl: "https://www.onlocationexp.com/fifa-world-cup-2026",
  },
};

export async function POST(request: Request) {
  if (!isAuthorizedAdmin(request)) {
    return unauthorizedResponse();
  }

  try {
    const body = (await request.json()) as {
      text?: string;
      source?: "fifa" | "onlocation" | "custom";
      sourceName?: string;
      sourceType?: SourceType;
      sourceUrl?: string;
      publish?: boolean;
    };

    if (!body.text?.trim()) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const lastUpdated = new Date().toISOString();
    const defaults =
      body.source && SOURCE_DEFAULTS[body.source]
        ? SOURCE_DEFAULTS[body.source]
        : {
            sourceName: body.sourceName ?? "Official Import",
            sourceType: body.sourceType ?? "Official FIFA Hospitality",
            sourceUrl: body.sourceUrl ?? FIFA_CHOOSE_MATCHES_URL,
          };

    const imported = parsePastedOfficialText(
      body.text,
      defaults,
      lastUpdated
    );

    if (imported.length === 0) {
      return NextResponse.json(
        {
          error:
            "No match listings parsed. Paste blocks with team names (France vs Senegal), group/stage, date, city, venue, and price.",
          records: [],
        },
        { status: 400 }
      );
    }

    if (body.publish) {
      const { records: cached } = getDirectoryCache();
      const merged = mergeOfficialAndDiscovered(imported, cached);
      const records = await mergePublicRecords(merged);
      const groupedEvents = groupRecords(records);
      const metrics = computeDirectoryMetrics(records);
      setDirectoryCache({ records, groupedEvents, metrics });

      return NextResponse.json({
        imported: imported.length,
        records: imported,
        publicCount: records.length,
        published: true,
      });
    }

    return NextResponse.json({
      imported: imported.length,
      records: imported,
      published: false,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
