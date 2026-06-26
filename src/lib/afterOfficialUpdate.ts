import { revalidatePath } from "next/cache";
import { syncOfficialKnockoutBracket } from "@/lib/officialKnockoutBracket";
import { recalculateAllScores } from "@/lib/scoring";

export function revalidateOfficialResults(matchNumber?: number) {
  revalidatePath("/inicio");
  revalidatePath("/grupos");
  revalidatePath("/eliminatorias");
  revalidatePath("/premios");
  revalidatePath("/mis-pronosticos");
  revalidatePath("/clasificacion");
  revalidatePath("/reglas");
  revalidatePath("/perfil");
  revalidatePath("/jugadores");
  revalidatePath("/admin");
  revalidatePath("/admin/partidos");
  if (matchNumber) {
    revalidatePath(`/partidos/${matchNumber}`);
    revalidatePath(`/admin/partidos/${matchNumber}`);
  }
}

/** Sync KO + recalcular puntos (bloqueante; usar en botón Recalcular o cron). */
export async function afterOfficialResultsUpdate(matchNumber?: number) {
  try {
    await syncOfficialKnockoutBracket();
  } catch (error) {
    console.error("[afterOfficialResultsUpdate] syncOfficialKnockoutBracket:", error);
  }

  await recalculateAllScores();
  revalidateOfficialResults(matchNumber);
}

function recalcApiBaseUrl() {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

/**
 * Lanza recálculo en otra invocación para no bloquear guardar partido.
 * En Vercel evita timeout y UI congelada.
 */
export function scheduleAfterOfficialResultsUpdate(matchNumber?: number) {
  const secret = process.env.CRON_SECRET ?? process.env.SETUP_SECRET_TOKEN;
  if (!secret) {
    void afterOfficialResultsUpdate(matchNumber).catch((error) => {
      console.error("[scheduleAfterOfficialResultsUpdate]", error);
    });
    return;
  }

  void fetch(`${recalcApiBaseUrl()}/api/admin/recalculate-scores`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ matchNumber: matchNumber ?? null }),
  }).catch((error) => {
    console.error("[scheduleAfterOfficialResultsUpdate] fetch:", error);
  });
}
