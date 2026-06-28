import { confirmPhase1Action } from "@/lib/actions";
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

export async function Phase2InfoCard({ userId }: { userId: string }) {
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
    <Card title="Fase 2 · Eliminatorias">
      <p className="mb-4 text-sm text-emerald-100">
        Rellena tus pronósticos en <strong>Mis pronósticos → Eliminatorias</strong> y pulsa{" "}
        <strong>Guardar todo</strong>. No hace falta enviar nada desde el perfil: cada ronda se
        bloquea sola al inicio de su primer partido. El cuadro de honor se guarda aparte y queda
        bloqueado al confirmarlo.
      </p>
      <ul className="mb-4 space-y-1 text-sm text-emerald-200">
        <li>
          Eliminatorias guardadas: {stats.knockoutPredictions}/{stats.knockoutMatches}
        </li>
        <li>
          Cuadro de honor: {stats.bracketComplete ? "✓ guardado" : "pendiente (solo en dieciseisavos)"}
        </li>
      </ul>
      {phase.firstKnockoutMatch?.kickoffAt && (
        <p className="text-xs text-emerald-400">
          Octavos y rondas siguientes se abren cuando el administrador publique todos los
          resultados oficiales de la ronda anterior.
        </p>
      )}
    </Card>
  );
}

/** @deprecated Fase 2 ya no requiere envío manual; usar Phase2InfoCard */
export async function ConfirmPhase2Card({ userId }: { userId: string }) {
  return Phase2InfoCard({ userId });
}

/** @deprecated use ConfirmPhase1Card */
export async function ConfirmPredictionsCard({ userId }: { userId: string }) {
  return ConfirmPhase1Card({ userId });
}
