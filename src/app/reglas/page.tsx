import type { ReactNode } from "react";
import { PageShell, Card } from "@/components/ui";
import { SCORING_PHASE_LABELS, SCORING_RULES } from "@/lib/scoring-config";

function ExampleBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-emerald-950/50 p-4 text-sm text-emerald-100">
      <p className="mb-2 font-semibold text-emerald-300">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

export default function ReglasPage() {
  const phases = ["fase1", "fase2"] as const;

  return (
    <PageShell
      title="Reglas y sistema de puntos"
      subtitle="Cómo pronosticar, cuándo se cierra cada cosa y cómo se calculan los puntos."
    >
      <div className="space-y-8">
        <Card title="Cómo funciona la porra">
          <div className="space-y-4 text-sm text-emerald-100">
            <div>
              <h3 className="mb-2 font-semibold text-white">Fase 1 · Grupos y premios</h3>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Rellenas partidos de grupos, clasificación de cada grupo (1º a 4º), eliges tus
                  8 mejores terceros y los premios individuales.
                </li>
                <li>
                  Cuando termines, <strong>envías la Fase 1 desde Mi perfil</strong>. Después no
                  podrás cambiar grupos, terceros ni premios (solo el admin puede desbloquearte).
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-white">Fase 2 · Eliminatorias</h3>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Se abre cuando el admin publica el <strong>último resultado de grupos</strong> y
                  los <strong>8 mejores terceros oficiales</strong>.
                </li>
                <li>
                  Los cruces de dieciseisavos usan la <strong>clasificación oficial</strong> (no tu
                  predicción de grupos). Pronosticas marcadores en{" "}
                  <strong>Mis pronósticos → Eliminatorias</strong> y pulsas{" "}
                  <strong>Guardar todo</strong>.
                </li>
                <li>
                  <strong>No hay “enviar Fase 2”.</strong> Cada ronda se cierra sola al inicio de
                  su primer partido. La siguiente ronda se abre cuando el admin publica{" "}
                  <strong>todos</strong> los resultados oficiales de la anterior.
                </li>
                <li>
                  El <strong>cuadro de honor</strong> (campeón, subcampeón, 3º y 4º) lo eliges
                  manualmente durante los dieciseisavos y queda bloqueado al guardarlo.
                </li>
              </ul>
            </div>
            <ExampleBox title="Orden de rondas en eliminatorias">
              <p>Dieciseisavos → Octavos → Cuartos → Semifinales → 3º puesto y Final</p>
              <p className="text-emerald-300">
                Ejemplo: no puedes pronosticar octavos hasta que el admin haya guardado los 16
                resultados oficiales de dieciseisavos.
              </p>
            </ExampleBox>
          </div>
        </Card>

        <Card title="Cuándo suman puntos">
          <ul className="list-disc space-y-2 pl-5 text-sm text-emerald-100">
            <li>
              <strong>Partidos (grupos y eliminatorias):</strong> en cuanto el admin publica cada
              resultado real.
            </li>
            <li>
              <strong>Clasificación de grupos y 8 mejores terceros:</strong> solo cuando termina la
              fase de grupos (último partido con resultado + 8 terceros oficiales guardados).
            </li>
            <li>
              <strong>Premios individuales:</strong> cuando el admin publica el ganador oficial de
              cada premio.
            </li>
            <li>
              <strong>Cuadro de honor:</strong> cuando el admin publica el cuadro de honor
              oficial del torneo.
            </li>
            <li>
              Si el admin corrige un resultado o una clasificación, los puntos se{" "}
              <strong>recalculan automáticamente</strong>.
            </li>
          </ul>
        </Card>

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

                {phase === "fase1" && (
                  <div className="space-y-4">
                    <ExampleBox title="Partidos de grupos · ejemplo">
                      <p>Real: Brasil 2-1 Marruecos · Tu pronóstico: 2-1 → <strong>5 pts</strong> (3 ganador + 2 exacto)</p>
                      <p>Real: Brasil 2-1 · Tu pronóstico: 1-0 → <strong>3 pts</strong> (aciertas que gana Brasil, no el marcador)</p>
                      <p>Real: Brasil 2-1 · Tu pronóstico: 1-1 → <strong>0 pts</strong></p>
                    </ExampleBox>
                    <ExampleBox title="Clasificación de grupo · ejemplo (Grupo F)">
                      <p>Real: 1º Países Bajos, 2º Japón, 3º Suecia, 4º Túnez</p>
                      <p>Tu predicción: 1º Japón, 2º Países Bajos, 3º Suecia, 4º Túnez</p>
                      <p>
                        → <strong>6 pts</strong>: 4 pts (Países Bajos y Japón en top 2, sin orden)
                        + 2 pts (3º Suecia). El 4º acertado no suma puntos.
                      </p>
                      <p className="text-emerald-300">
                        Máximo por grupo: 9 pts (4 top 2 + 3 orden 1º/2º + 2 por el 3º).
                      </p>
                    </ExampleBox>
                    <ExampleBox title="8 mejores terceros">
                      <p>
                        De los 3º que predijiste en cada grupo, eliges 8 que crees que pasarán.
                        <strong> 3 pts por cada uno</strong> que coincida con los 8 oficiales
                        (máximo 24 pts).
                      </p>
                    </ExampleBox>
                    <ExampleBox title="Bota de Oro">
                      <p>
                        Nombras tu Top 3 de goleadores. <strong>10 pts</strong> por cada jugador
                        tuyo que esté en el Top 3 real (da igual el puesto; empates oficiales
                        cuentan).
                      </p>
                      <p>
                        Si además aciertas el orden exacto 1º-2º-3º: <strong>+10 pts bonus</strong>
                        (hasta 40 pts en total).
                      </p>
                    </ExampleBox>
                    <p className="text-xs text-emerald-400">
                      Balón de Oro, Guante de Oro y Mejor joven: 15 pts si aciertas el ganador
                      oficial.
                    </p>
                  </div>
                )}

                {phase === "fase2" && (
                  <div className="space-y-4">
                    <ExampleBox title="Eliminatorias · marcador y empates">
                      <p>
                        Pronosticas el marcador a los <strong>90&apos; o 120&apos;</strong> (antes
                        de penaltis). Lo que importa para puntos es <strong>quién pasa</strong>
                        (el ganador del cruce).
                      </p>
                      <p>
                        Si pronosticas empate (ej. 1-1), debes elegir <strong>quién pasa</strong>.
                        Si no eliges, ese partido vale 0 pts aunque el empate sea correcto.
                      </p>
                      <p className="text-emerald-300">
                        El admin, al guardar un empate real, también indica quién pasó (penaltis,
                        etc.).
                      </p>
                    </ExampleBox>
                    <ExampleBox title="Dieciseisavos / Octavos · ejemplo (5 + 3)">
                      <p>Real: 2-1 gana local · Tu 2-1 → <strong>8 pts</strong></p>
                      <p>Real: 2-1 · Tu 1-0 (mismo ganador) → <strong>5 pts</strong></p>
                      <p>Real: 1-1 pasa Brasil · Tu 1-1 pasa Brasil → <strong>8 pts</strong></p>
                      <p>Real: 1-1 pasa Brasil · Tu 2-2 pasa Brasil → <strong>5 pts</strong></p>
                      <p>Real: 1-1 pasa Brasil · Tu 1-1 pasa Japón → <strong>0 pts</strong></p>
                    </ExampleBox>
                    <ExampleBox title="Cuartos, semis, final y 3º puesto · ejemplo (8 + 4)">
                      <p>Misma lógica que dieciseisavos, pero con más puntos:</p>
                      <p>Ganador correcto → <strong>8 pts</strong> · Marcador exacto además → <strong>+4 pts</strong> (12 total)</p>
                    </ExampleBox>
                    <ExampleBox title="Cuadro de honor">
                      <p>
                        Es independiente de tus marcadores en la llave. Eliges campeón, subcampeón,
                        3º y 4º manualmente durante los dieciseisavos.
                      </p>
                      <p>
                        Puntos por acierto: campeón 40 · subcampeón 25 · 3º 15 · 4º 15 (se suman
                        si aciertas varios).
                      </p>
                    </ExampleBox>
                  </div>
                )}
              </div>
            </Card>
          );
        })}

        <Card title="Resumen rápido">
          <div className="grid gap-4 text-sm text-emerald-100 md:grid-cols-2">
            <div className="rounded-xl bg-emerald-950/40 p-4">
              <p className="mb-2 font-semibold text-emerald-300">Fase 1</p>
              <ul className="space-y-1 text-xs">
                <li>Grupos: 3 pts ganador/empate + 2 exacto</li>
                <li>Clasificación: hasta 9 pts por grupo</li>
                <li>8 terceros: 3 pts × acierto (máx. 24)</li>
                <li>Premios: 15 pts (Bota hasta 40)</li>
              </ul>
            </div>
            <div className="rounded-xl bg-emerald-950/40 p-4">
              <p className="mb-2 font-semibold text-emerald-300">Fase 2</p>
              <ul className="space-y-1 text-xs">
                <li>16avos/octavos: 5 pts ganador + 3 exacto</li>
                <li>Cuartos en adelante: 8 pts ganador + 4 exacto</li>
                <li>Honor: 40 + 25 + 15 + 15 por aciertos</li>
                <li>Empate KO: hay que elegir quién pasa</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
