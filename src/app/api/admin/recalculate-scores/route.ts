import { NextResponse } from "next/server";
import { afterOfficialResultsUpdate } from "@/lib/afterOfficialUpdate";

/**
 * Recálculo de puntos en invocación aparte (llamado tras guardar partido).
 * Protegido con CRON_SECRET o SETUP_SECRET_TOKEN.
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET ?? process.env.SETUP_SECRET_TOKEN;
  const authHeader = request.headers.get("authorization");

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      matchNumber?: number | null;
    };
    const matchNumber =
      typeof body.matchNumber === "number" ? body.matchNumber : undefined;

    await afterOfficialResultsUpdate(matchNumber);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[recalculate-scores]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
export const maxDuration = 60;
