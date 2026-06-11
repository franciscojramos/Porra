import Link from "next/link";
import {
  createUserAction,
  completeUserPhase1Action,
  completeUserPhase2Action,
  unlockUserPhase1Action,
  unlockUserPhase2Action,
  saveOfficialStandingAction,
  saveOfficialBestThirdAction,
  saveOfficialAwardAction,
  saveOfficialFinalBracketAction,
  updateScoringAction,
  recalculateScoresAction,
} from "@/lib/actions";
import { getAdminData } from "@/lib/data";
import { getTournamentPhaseState } from "@/lib/tournamentPhase";
import { getMatchAwayName, getMatchHomeName } from "@/lib/matchDisplay";
import { PageShell, Card, SubmitButton, TeamSelect } from "@/components/ui";
import { OfficialAwardForm } from "@/components/OfficialAwardForm";
import { AwardCategory } from "@prisma/client";

const AWARD_CATEGORIES = Object.keys({
  GOLDEN_BALL: true,
  GOLDEN_BOOT: true,
  GOLDEN_GLOVE: true,
  BEST_YOUNG: true,
}) as AwardCategory[];

export default async function AdminPage() {
  const [data, phase] = await Promise.all([getAdminData(), getTournamentPhaseState()]);

  const thirdPlaceTeams = data.teams.filter((t) => data.officialThirdPlaceIds.has(t.id));
  const knockoutMatches = data.matches.filter((m) => m.stage !== "GROUP");

  return (
    <PageShell
      title="Panel de administración"
      subtitle="Crea usuarios, introduce resultados reales y configura la puntuación."
    >
      <div className="space-y-8">
        <Card title="Estado del torneo">
          <ul className="space-y-1 text-sm text-emerald-100">
            <li>
              Último partido grupos:{" "}
              {phase.lastGroupFinished ? "✓ con resultado" : "pendiente"}
              {phase.lastGroupMatch ? ` (#${phase.lastGroupMatch.matchNumber})` : ""}
            </li>
            <li>
              8 terceros oficiales:{" "}
              {phase.officialThirdsReady ? "✓ guardados" : "pendiente (8)"}
            </li>
            <li>
              Fase 2 usuarios:{" "}
              {phase.knockoutWindowOpen
                ? "abierta"
                : phase.phase2Closed
                  ? "cerrada (plazo)"
                  : "cerrada (faltan datos admin)"}
            </li>
            <li className="text-emerald-300">
              Puntuación: partidos → al guardar cada resultado; grupos/terceros → tras último
              partido de grupos + 8 terceros (recalcula si cambia clasificación por desempate)
            </li>
          </ul>
        </Card>

        <Card title="Crear usuario">
          <form action={createUserAction} className="grid gap-3 md:grid-cols-3">
            <input
              name="displayName"
              placeholder="Nombre visible"
              required
              className="rounded-lg border border-white/10 bg-emerald-950 px-3 py-2"
            />
            <input
              name="username"
              placeholder="usuario"
              required
              className="rounded-lg border border-white/10 bg-emerald-950 px-3 py-2"
            />
            <input
              name="password"
              type="password"
              placeholder="contraseña"
              required
              className="rounded-lg border border-white/10 bg-emerald-950 px-3 py-2"
            />
            <div className="md:col-span-3">
              <SubmitButton label="Crear usuario" />
            </div>
          </form>
          <div className="mt-4 space-y-2">
            {data.users.map((user) => (
              <div
                key={user.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-emerald-950/60 px-3 py-2 text-sm"
              >
                <span>
                  {user.displayName} ({user.username})
                  {user.isAdmin ? " · admin" : ""}
                  {user.phase1Locked ? " · F1 ✓" : " · F1 …"}
                  {user.phase2Locked ? " · F2 ✓" : " · F2 …"}
                </span>
                <div className="flex flex-wrap gap-3">
                  {!user.isAdmin && (
                    <Link
                      href={`/admin/usuarios/${user.id}`}
                      className="text-amber-300 hover:underline"
                    >
                      Editar pronósticos
                    </Link>
                  )}
                  {!user.isAdmin && !user.phase1Locked && (
                    <form action={completeUserPhase1Action}>
                      <input type="hidden" name="userId" value={user.id} />
                      <button type="submit" className="text-emerald-300 hover:underline">
                        Enviar F1
                      </button>
                    </form>
                  )}
                  {!user.isAdmin && user.phase1Locked && !user.phase2Locked && (
                    <form action={completeUserPhase2Action}>
                      <input type="hidden" name="userId" value={user.id} />
                      <button type="submit" className="text-emerald-300 hover:underline">
                        Enviar F2
                      </button>
                    </form>
                  )}
                  {!user.isAdmin && (user.phase1Locked || user.phase2Locked) && (
                    <>
                      {user.phase1Locked && (
                        <form action={unlockUserPhase1Action}>
                          <input type="hidden" name="userId" value={user.id} />
                          <button type="submit" className="text-amber-300 hover:underline">
                            Desbloq. F1
                          </button>
                        </form>
                      )}
                      {user.phase2Locked && (
                        <form action={unlockUserPhase2Action}>
                          <input type="hidden" name="userId" value={user.id} />
                          <button type="submit" className="text-amber-300 hover:underline">
                            Desbloq. F2
                          </button>
                        </form>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Configuración de puntos">
          <form action={updateScoringAction} className="space-y-3">
            {data.scoringRules.map((rule) => (
              <div key={rule.key} className="flex flex-wrap items-center gap-3">
                <input type="hidden" name="key" value={rule.key} />
                <span className="flex-1">{rule.label}</span>
                <input
                  type="number"
                  name={`points_${rule.key}`}
                  defaultValue={rule.points}
                  className="w-20 rounded-lg border border-white/10 bg-emerald-950 px-2 py-1 text-center"
                />
              </div>
            ))}
            <SubmitButton label="Guardar puntuación" />
          </form>
          <form action={recalculateScoresAction} className="mt-4">
            <button
              type="submit"
              className="rounded-xl border border-amber-400 px-4 py-2 text-sm text-amber-200"
            >
              Recalcular todos los puntos
            </button>
          </form>
        </Card>

        <Card title="Resultados reales · Grupos">
          <div className="space-y-6">
            {data.groups.map((group) => {
              const teams = group.teams.map((gt) => gt.team);
              const official = data.officialStandings[group.id];

              return (
                <div key={group.id} className="rounded-xl bg-emerald-950/30 p-4">
                  <h3 className="mb-3 font-semibold">Grupo {group.id}</h3>
                  <form
                    action={saveOfficialStandingAction}
                    className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4"
                  >
                    <input type="hidden" name="groupId" value={group.id} />
                    <TeamSelect
                      name="firstTeamId"
                      label="1º real"
                      teams={teams}
                      defaultValue={official?.firstTeamId}
                    />
                    <TeamSelect
                      name="secondTeamId"
                      label="2º real"
                      teams={teams}
                      defaultValue={official?.secondTeamId}
                    />
                    <TeamSelect
                      name="thirdTeamId"
                      label="3º real"
                      teams={teams}
                      defaultValue={official?.thirdTeamId}
                    />
                    <TeamSelect
                      name="fourthTeamId"
                      label="4º real"
                      teams={teams}
                      defaultValue={official?.fourthTeamId}
                    />
                    <div className="md:col-span-2 xl:col-span-4">
                      <SubmitButton label="Guardar clasificación real" />
                    </div>
                  </form>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="8 mejores terceros (oficial)">
          <p className="mb-4 text-sm text-emerald-100">
            Elige 8 entre los terceros de cada grupo (según clasificación real guardada arriba).
            Al guardar se genera el cuadro de dieciseisavos con nombres reales.
          </p>
          {thirdPlaceTeams.length === 0 ? (
            <p className="text-sm text-amber-200">
              Guarda primero la clasificación real de todos los grupos para ver los 12 terceros.
            </p>
          ) : (
            <form action={saveOfficialBestThirdAction} className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {thirdPlaceTeams.map((team) => (
                <label
                  key={team.id}
                  className="flex items-center gap-2 rounded-lg bg-emerald-950/40 px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    name="teamId"
                    value={team.id}
                    defaultChecked={data.officialThirdIds.has(team.id)}
                  />
                  <span>
                    {team.name} ({team.code})
                  </span>
                </label>
              ))}
              <div className="sm:col-span-2 lg:col-span-3">
                <SubmitButton label="Guardar mejores terceros oficiales" />
              </div>
            </form>
          )}
        </Card>

        {phase.phase2Open && (
          <Card title="Cuadro eliminatorias (oficial · dieciseisavos)">
            <p className="mb-4 text-sm text-emerald-100">
              Equipos resueltos automáticamente desde clasificación + 8 terceros. Se actualiza al
              guardar resultados en partidos posteriores.
            </p>
            <div className="grid gap-2">
              {knockoutMatches
                .filter((m) => m.stage === "ROUND_32")
                .map((match) => (
                  <div
                    key={match.id}
                    className="flex flex-wrap items-center gap-2 rounded-lg bg-emerald-950/40 px-3 py-2 text-sm"
                  >
                    <span className="text-emerald-400">#{match.matchNumber}</span>
                    <span>{getMatchHomeName(match, data.teamMap)}</span>
                    <span className="text-emerald-300">vs</span>
                    <span>{getMatchAwayName(match, data.teamMap)}</span>
                    <Link
                      href={`/admin/partidos/${match.matchNumber}`}
                      className="ml-auto text-amber-300 hover:underline"
                    >
                      Editar
                    </Link>
                  </div>
                ))}
            </div>
          </Card>
        )}

        <Card title="Resultados de partidos">
          <p className="mb-4 text-sm text-emerald-100">
            Introduce marcador y goleadores partido a partido. En fase de grupos los goleadores se
            eligen de la plantilla; en eliminatorias, texto libre hasta que haya equipos definidos.
          </p>
          <Link
            href="/admin/partidos"
            className="inline-block rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
          >
            Gestionar partidos →
          </Link>

          <div className="mt-6 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
              Próximos pendientes
            </p>
            {data.matches
              .filter((m) => m.homeScore === null || m.awayScore === null)
              .slice(0, 5)
              .map((match) => (
                <div
                  key={match.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-emerald-950/30 px-3 py-2 text-sm"
                >
                  <span>
                    #{match.matchNumber} · {getMatchHomeName(match, data.teamMap)} vs{" "}
                    {getMatchAwayName(match, data.teamMap)}
                  </span>
                  <Link
                    href={`/admin/partidos/${match.matchNumber}`}
                    className="text-amber-300 hover:underline"
                  >
                    Editar
                  </Link>
                </div>
              ))}
          </div>
        </Card>

        <Card title="Cuadro de honor oficial (Fase 2)">
          <p className="mb-4 text-sm text-emerald-100">
            Campeón, subcampeón, 3º y 4º puesto. Al guardar se recalculan los puntos del jackpot.
          </p>
          <form
            action={saveOfficialFinalBracketAction}
            className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
          >
            <TeamSelect
              name="championTeamId"
              label="Campeón"
              teams={data.teams}
              defaultValue={data.officialFinalBracket?.championTeamId ?? undefined}
            />
            <TeamSelect
              name="runnerUpTeamId"
              label="Subcampeón"
              teams={data.teams}
              defaultValue={data.officialFinalBracket?.runnerUpTeamId ?? undefined}
            />
            <TeamSelect
              name="thirdPlaceTeamId"
              label="3º puesto"
              teams={data.teams}
              defaultValue={data.officialFinalBracket?.thirdPlaceTeamId ?? undefined}
            />
            <TeamSelect
              name="fourthPlaceTeamId"
              label="4º puesto"
              teams={data.teams}
              defaultValue={data.officialFinalBracket?.fourthPlaceTeamId ?? undefined}
            />
            <div className="md:col-span-2 xl:col-span-4">
              <SubmitButton label="Guardar cuadro de honor" />
            </div>
          </form>
        </Card>

        <Card title="Premios oficiales">
          <div className="grid gap-4 lg:grid-cols-2">
            {AWARD_CATEGORIES.map((category) => (
              <OfficialAwardForm
                key={category}
                category={category}
                official={data.officialAwards[category]}
                action={saveOfficialAwardAction}
              />
            ))}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
