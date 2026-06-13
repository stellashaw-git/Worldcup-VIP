import { NextResponse } from "next/server";
import { isAuthorizedAdmin, unauthorizedResponse } from "@/lib/admin/auth";
import {
  buildExportFilename,
  buildLeadsCsv,
} from "@/lib/leads/export";
import { loadLeads } from "@/lib/leads/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isAuthorizedAdmin(request)) {
    return unauthorizedResponse();
  }

  const leads = await loadLeads();
  const csv = buildLeadsCsv(leads);
  const filename = buildExportFilename("csv");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
