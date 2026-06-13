import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 120;

export async function GET() {
  if (process.env.VERCEL) {
    return NextResponse.json({
      ok: false,
      error:
        "Debug extraction is not available on Vercel. Use /admin/import locally or paste listings.",
    });
  }

  console.info("[BLACKBOOK] GET /api/debug-official started");
  const { debugFifaExtraction } = await import("@/lib/official-sources/debug-fifa");
  const result = await debugFifaExtraction(10);
  console.info(
    `[BLACKBOOK] GET /api/debug-official finished ok=${result.ok} cards=${result.totalCardsFound}`
  );
  return NextResponse.json(result);
}
