import { NextResponse } from "next/server";
import { syncPendingMatchResults } from "@/lib/footballData/syncResults";

/**
 * Cron: importa marcadores desde football-data.org cuando status === FINISHED.
 * Vercel Cron → GET /api/cron/sync-results (Authorization: Bearer CRON_SECRET)
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET no configurado" }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.FOOTBALL_DATA_TOKEN) {
    return NextResponse.json({ error: "FOOTBALL_DATA_TOKEN no configurado" }, { status: 500 });
  }

  try {
    const results = await syncPendingMatchResults();
    const summary = {
      checked: results.length,
      imported: results.filter((r) => r.status === "imported").length,
      pending: results.filter((r) => r.status === "pending").length,
      skipped: results.filter((r) => r.status === "skipped").length,
      errors: results.filter((r) => r.status === "error").length,
      results,
    };
    return NextResponse.json(summary);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[cron/sync-results]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
export const maxDuration = 60;
