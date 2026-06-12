import { PageShell, Card } from "@/components/ui";
import { SCORING_PHASE_LABELS, SCORING_RULES } from "@/lib/scoring-config";

export default function ReglasPage() {
  const phases = ["fase1", "fase2"] as const;

  return (
    <PageShell
      title="Sistema de puntos oficial"
      subtitle="Fase 1 (grupos + premios) y Fase 2 (eliminatorias + cuadro de honor). Los marcadores de eliminatorias cuentan sobre 90 o 120 minutos, antes de penaltis."
    >
      <div className="space-y-8">
        {phases.map((phase) => {
          const rules = SCORING_RULES.filter((r) => r.phase === phase);
          const blocks = Array.from(new Set(rules.map((r) => r.block)));

          return (
            <Card key={phase} title={SCORING_PHASE_LABELS[phase]}>
              <div className="space-y-6">
                {blocks.map((block) => (
                  <div key={block}>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-300">
                      {block}
                    </h3>
                    <ul className="space-y-2">
                      {rules
                        .filter((r) => r.block === block)
                        .map((rule) => (
                          <li
                            key={rule.key}
                            className="flex items-center justify-between rounded-xl bg-emerald-950/40 px-4 py-3"
                          >
                            <span className="text-emerald-100">{rule.label}</span>
                            <span className="text-lg font-bold text-emerald-300">
                              {rule.points} pts
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}

        <Card title="Notas importantes">
          <ul className="list-disc space-y-2 pl-5 text-sm text-emerald-100">
            <li>
              <strong>Cuándo suman puntos:</strong> los partidos puntúan en cuanto el admin
              publica cada resultado real. La clasificación de grupos y los 8 mejores terceros
              solo puntúan tras el <strong>último partido de grupos</strong> (con los 8 terceros
              oficiales guardados). Si el admin corrige una clasificación por desempate, los
              puntos se recalculan solos. Eliminatorias y cuadro de honor, partido a partido /
              cuando el admin publique el honor oficial.
            </li>
            <li>
              <strong>Marcador exacto:</strong> suma bonus al ganador (no sustituye). En grupos: 3+2=5.
              Dieciseisavos/octavos: 5+3=8. Cuartos, semis, final y 3.er puesto: 8+4=12.
            </li>
            <li>
              <strong>Eliminatorias:</strong> pronosticas el marcador a los 90&apos; o 120&apos; (antes
              de penaltis). Si empatas, debes elegir quién pasa. Lo mismo aplica al resultado oficial
              que guarda el admin.
            </li>
            <li>
              <strong>Clasificación de grupo:</strong> 4 pts por acertar los 2 clasificados sin orden;
              +3 si además aciertas 1º y 2º en su sitio; +2 por el 3º exacto.
            </li>
            <li>
              <strong>Bota de Oro:</strong> 10 pts por cada jugador de tu Top 3 que esté en el Top 3
              real (empates válidos). +10 bonus si aciertas el orden exacto 1º-2º-3º.
            </li>
            <li>
              <strong>Mejores terceros:</strong> 3 pts por acierto, máximo 24 pts (8 equipos).
            </li>
            <li>
              El cuadro de honor (campeón, subcampeón, 3º y 4º) se calcula solo a partir de
              tus marcadores en la llave de eliminatorias.
            </li>
          </ul>
        </Card>
      </div>
    </PageShell>
  );
}
