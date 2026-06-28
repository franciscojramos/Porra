import type { KnockoutStageEditState } from "@/lib/knockoutRoundUnlock";
import type { TournamentPhaseState } from "@/lib/tournamentPhase";

export function KnockoutRoundBanner({
  phase,
  stageEditStates,
}: {
  phase: TournamentPhaseState;
  stageEditStates: KnockoutStageEditState[];
}) {
  if (!phase.phase2Open) {
    return null;
  }

  const open = stageEditStates.filter((s) => s.editable);
  const waiting = stageEditStates.filter((s) => !s.editable && !s.pastDeadline);

  if (open.length === 0 && waiting.length === 0) {
    return (
      <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3">
        <h3 className="font-semibold text-amber-100">Eliminatorias · plazo cerrado</h3>
        <p className="mt-2 text-sm text-amber-100">
          Ya no puedes modificar pronósticos de eliminatorias.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3">
      <h3 className="font-semibold text-emerald-100">Eliminatorias por rondas</h3>
      <p className="mt-2 text-sm text-emerald-100">
        Solo puedes pronosticar la ronda abierta. Las siguientes se desbloquean cuando el
        administrador publique todos los resultados oficiales de la ronda anterior.
      </p>
      {open.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm text-emerald-200">
          {open.map((s) => (
            <li key={s.stage}>
              <strong className="text-emerald-100">{s.label}</strong>
              {" · "}
              abierta
              {s.closesAtLabel ? (
                <>
                  {" "}
                  hasta {s.closesAtLabel} (Madrid)
                </>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      {waiting.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm text-emerald-400">
          {waiting.map((s) => (
            <li key={s.stage}>
              <strong>{s.label}</strong>
              {" · "}
              {s.lockedReason}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
