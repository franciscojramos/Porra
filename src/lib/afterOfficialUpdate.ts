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

/** Tras cambiar resultados oficiales: sync KO (best-effort) y recalcular puntos siempre. */
export async function afterOfficialResultsUpdate(matchNumber?: number) {
  try {
    await syncOfficialKnockoutBracket();
  } catch (error) {
    console.error("[afterOfficialResultsUpdate] syncOfficialKnockoutBracket:", error);
  }

  await recalculateAllScores();
  revalidateOfficialResults(matchNumber);
}
