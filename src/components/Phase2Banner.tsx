import type { TournamentPhaseState } from "@/lib/tournamentPhase";

export function Phase2Banner({ phase }: { phase: TournamentPhaseState }) {
  if (!phase.phase2Open) {
    const missing: string[] = [];
    if (!phase.lastGroupFinished) {
      missing.push(
        `resultado del último partido de grupos${
          phase.lastGroupMatch ? ` (#${phase.lastGroupMatch.matchNumber})` : ""
        }`
      );
    }
    if (!phase.officialThirdsReady) {
      missing.push("los 8 mejores terceros oficiales");
    }

    return (
      <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3">
        <h3 className="font-semibold text-emerald-100">Fase 2 · Eliminatorias cerrada</h3>
        <p className="mt-2 text-sm text-emerald-100">
          Los pronósticos de eliminatorias se abrirán cuando el administrador publique{" "}
          {missing.length > 0 ? (
            <>
              {missing.map((item, i) => (
                <span key={item}>
                  {i > 0 && i === missing.length - 1 ? " y " : i > 0 ? ", " : ""}
                  <strong>{item}</strong>
                </span>
              ))}
            </>
          ) : (
            "los datos oficiales de cierre de grupos"
          )}
          .
        </p>
        {phase.firstKnockoutMatch?.kickoffAt && (
          <p className="mt-2 text-xs text-emerald-400">
            Cierre automático: saque inicial del partido #{phase.firstKnockoutMatch.matchNumber}{" "}
            ({phase.closesAtLabel}, hora de Madrid).
          </p>
        )}
      </div>
    );
  }

  if (phase.phase2Closed) {
    return (
      <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3">
        <h3 className="font-semibold text-amber-100">Fase 2 · Plazo cerrado</h3>
        <p className="mt-2 text-sm text-amber-100">
          El plazo para pronosticar eliminatorias terminó con el inicio del partido #
          {phase.firstKnockoutMatch?.matchNumber} ({phase.closesAtLabel}, hora de Madrid).
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-4 py-3">
      <h3 className="font-semibold text-emerald-100">Fase 2 · Eliminatorias abiertas</h3>
      <p className="mt-2 text-sm text-emerald-100">
        Ya puedes pronosticar el cuadro real de eliminatorias. El cuadro de honor (campeón,
        subcampeón, 3º y 4º) se calcula solo a partir de tus marcadores en la llave.
      </p>
      {phase.firstKnockoutMatch?.kickoffAt && (
        <p className="mt-2 text-xs text-amber-200">
          Cierra automáticamente: {phase.closesAtLabel} (hora de Madrid), inicio del partido #
          {phase.firstKnockoutMatch.matchNumber}.
        </p>
      )}
    </div>
  );
}
