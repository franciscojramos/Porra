import { confirmPhase1Action, confirmPhase2Action } from "@/lib/actions";
import { getCompletionStats } from "@/lib/predictions";
import { getTournamentPhaseState } from "@/lib/tournamentPhase";
import { Card, SubmitButton } from "@/components/ui";

export async function ConfirmPhase1Card({ userId }: { userId: string }) {
  const stats = await getCompletionStats(userId);

  return (
    <Card title="Enviar Fase 1 (grupos y premios)">
      <p className="mb-4 text-sm text-emerald-100">
        Cuando envíes la <strong>Fase 1</strong>, no podrás cambiar partidos de grupos,
        clasificaciones, mejores terceros ni premios. Podrás seguir rellenando eliminatorias
        cuando el admin abra la Fase 2.
      </p>
      <ul className="mb-4 space-y-1 text-sm text-emerald-200">
        <li>
          Partidos de grupos: {stats.matchPredictions}/{stats.groupMatches}
        </li>
        <li>
          Clasificaciones: {stats.standingPredictions}/{stats.groups} grupos
        </li>
        <li>Mejores terceros: {stats.bestThird}/8</li>
        <li>Premios: {stats.awards}/4</li>
      </ul>
      {!stats.phase1Complete && (
        <p className="mb-4 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          Aún te faltan pronósticos de Fase 1. Puedes enviar igualmente, pero lo ideal es
          completarlos todos antes.
        </p>
      )}
      <form action={confirmPhase1Action} className="space-y-4">
        <label className="flex items-start gap-2 text-sm text-emerald-100">
          <input type="checkbox" name="confirmed" required className="mt-1" />
          <span>
            Confirmo que he revisado mi Fase 1 y entiendo que no podré modificar grupos,
            terceros ni premios después.
          </span>
        </label>
        <SubmitButton label="Enviar Fase 1 y bloquear" />
      </form>
    </Card>
  );
}

export async function ConfirmPhase2Card({ userId }: { userId: string }) {
  const [stats, phase] = await Promise.all([
    getCompletionStats(userId),
    getTournamentPhaseState(),
  ]);

  if (!phase.knockoutWindowOpen) {
    return (
      <Card title="Fase 2 · Eliminatorias">
        <p className="text-sm text-emerald-100">
          La Fase 2 se abrirá cuando el administrador publique el resultado del último partido
          de grupos y los 8 mejores terceros oficiales.
        </p>
      </Card>
    );
  }

  return (
    <Card title="Enviar Fase 2 (eliminatorias)">
        <p className="mb-4 text-sm text-emerald-100">
          Cuando envíes la <strong>Fase 2</strong>, no podrás cambiar tus marcadores de
          eliminatorias. El cuadro de honor se elige aparte durante los dieciseisavos y queda
          bloqueado al guardarlo.
        </p>
      <ul className="mb-4 space-y-1 text-sm text-emerald-200">
        <li>
          Eliminatorias: {stats.knockoutPredictions}/{stats.knockoutMatches}
        </li>
        <li>Cuadro de honor: {stats.bracketComplete ? "✓" : "pendiente (solo en dieciseisavos)"}</li>
      </ul>
      {phase.firstKnockoutMatch?.kickoffAt && (
        <p className="mb-4 text-xs text-amber-200">
          Cada ronda cierra al inicio de su primer partido. Los octavos se abrirán cuando el
          administrador publique todos los resultados oficiales de dieciseisavos.
        </p>
      )}
      {!stats.phase2Complete && (
        <p className="mb-4 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          Aún te faltan pronósticos de eliminatorias. Puedes enviar igualmente.
        </p>
      )}
      <form action={confirmPhase2Action} className="space-y-4">
        <label className="flex items-start gap-2 text-sm text-emerald-100">
          <input type="checkbox" name="confirmed" required className="mt-1" />
          <span>
            Confirmo que he revisado mis eliminatorias y entiendo que no podré modificarlas
            después.
          </span>
        </label>
        <SubmitButton label="Enviar Fase 2 y bloquear" />
      </form>
    </Card>
  );
}

/** @deprecated use ConfirmPhase1Card */
export async function ConfirmPredictionsCard({ userId }: { userId: string }) {
  return ConfirmPhase1Card({ userId });
}
