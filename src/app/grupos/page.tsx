import {
  saveMatchPredictionAction,
  saveStandingPredictionAction,
  saveBestThirdAction,
} from "@/lib/actions";
import { getGroupsWithData } from "@/lib/data";
import { getOfficialResults } from "@/lib/official";
import { getMatchAwayName, getMatchHomeName } from "@/lib/matchDisplay";
import { LockBanner, DraftBanner } from "@/components/LockBanner";
import { MatchMeta } from "@/components/MatchMeta";
import { OfficialGroupStanding } from "@/components/OfficialGroupStanding";
import { OfficialMatchResult } from "@/components/OfficialMatchResult";
import { PageShell, Card, ScoreInput, SubmitButton, TeamSelect } from "@/components/ui";

export default async function GruposPage() {
  const [data, official] = await Promise.all([getGroupsWithData(), getOfficialResults()]);

  const {
    groups,
    teamMap,
    matchPredictions,
    standingPredictions,
    bestThirdTeamIds,
    predictedThirdTeams,
    locked,
    editable,
  } = data;

  return (
    <PageShell
      title="Fase de grupos"
      subtitle="Pronostica el marcador de cada partido y la clasificación final 1º-4º de cada grupo. Luego elige los 8 mejores terceros."
    >
      <LockBanner locked={locked} phase="phase1" />
      {!locked && editable && <DraftBanner phase="phase1" />}
      <div className="space-y-8">
      {official.hasThirds && (
        <Card title="8 mejores terceros oficiales">
          <ul className="flex flex-wrap gap-2">
            {official.officialThirdTeams.map((team) => (
              <li
                key={team.id}
                className="rounded-full bg-emerald-500/20 px-3 py-1 text-sm text-emerald-100"
              >
                {team.name} ({team.code})
              </li>
            ))}
          </ul>
        </Card>
      )}
      {groups.map((group) => {
          const teams = group.teams.map((gt) => gt.team);
          const standing = standingPredictions[group.id];
          const officialStanding = official.standingsByGroup[group.id];

          return (
            <Card key={group.id} title={`Grupo ${group.id}`}>
              <div className="mb-4 flex flex-wrap gap-2">
                {group.teams.map((gt) => (
                  <span
                    key={gt.teamId}
                    className="rounded-full bg-emerald-950/50 px-3 py-1 text-xs text-emerald-100"
                  >
                    {gt.position}. {gt.team.name}
                  </span>
                ))}
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-emerald-300">
                    Partidos
                  </h3>
                  <div className="grid gap-3">
                    {group.matches.map((match) => {
                      const prediction = matchPredictions[match.id];

                      return (
                        <form
                          key={match.id}
                          action={editable ? saveMatchPredictionAction : undefined}
                          className="flex flex-col gap-2 rounded-xl bg-emerald-950/40 p-3"
                        >
                          <div className="flex flex-wrap items-center gap-3">
                            <MatchMeta match={match} />
                            <input type="hidden" name="matchId" value={match.id} />
                            <span className="min-w-[120px] font-medium">
                              {getMatchHomeName(match, teamMap)}
                            </span>
                            <ScoreInput
                              name="homeScore"
                              label="Local"
                              defaultValue={prediction?.homeScore}
                              disabled={!editable}
                            />
                            <span className="text-emerald-300">-</span>
                            <ScoreInput
                              name="awayScore"
                              label="Visit."
                              defaultValue={prediction?.awayScore}
                              disabled={!editable}
                            />
                            <span className="min-w-[120px] font-medium">
                              {getMatchAwayName(match, teamMap)}
                            </span>
                            {editable && <SubmitButton label="Guardar" />}
                          </div>
                          <OfficialMatchResult
                            match={match}
                            teamMap={teamMap}
                            prediction={prediction}
                          />
                        </form>
                      );
                    })}
                  </div>
                </div>

                <form
                  action={editable ? saveStandingPredictionAction : undefined}
                  className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
                >
                  <input type="hidden" name="groupId" value={group.id} />
                  <TeamSelect
                    name="firstTeamId"
                    label="1º puesto"
                    teams={teams}
                    defaultValue={standing?.firstTeamId}
                    disabled={!editable}
                  />
                  <TeamSelect
                    name="secondTeamId"
                    label="2º puesto"
                    teams={teams}
                    defaultValue={standing?.secondTeamId}
                    disabled={!editable}
                  />
                  <TeamSelect
                    name="thirdTeamId"
                    label="3º puesto"
                    teams={teams}
                    defaultValue={standing?.thirdTeamId}
                    disabled={!editable}
                  />
                  <TeamSelect
                    name="fourthTeamId"
                    label="4º puesto"
                    teams={teams}
                    defaultValue={standing?.fourthTeamId}
                    disabled={!editable}
                  />
                  {editable && (
                    <div className="md:col-span-2 xl:col-span-4">
                      <SubmitButton label="Guardar clasificación del grupo" />
                    </div>
                  )}
                </form>

                {officialStanding && (
                  <OfficialGroupStanding
                    groupId={group.id}
                    standing={officialStanding}
                    teamMap={teamMap}
                    userStanding={standing}
                  />
                )}
              </div>
            </Card>
          );
        })}

        <Card title="8 mejores terceros">
          <p className="mb-4 text-sm text-emerald-100">
            Elige <strong>8 de tus terceros predichos</strong> (uno por grupo) que crees que
            pasarán como mejores terceros. Primero guarda la clasificación 1º-4º de cada grupo.
          </p>
          {predictedThirdTeams.length === 0 ? (
            <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
              Aún no has predicho ningún 3º puesto. Rellena la clasificación de cada grupo arriba.
            </p>
          ) : (
            <form
              action={editable ? saveBestThirdAction : undefined}
              className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
            >
              {predictedThirdTeams.map(({ groupId, team }) => {
                const isOfficial = official.officialThirdIds.has(team.id);
                return (
                  <label
                    key={team.id}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                      isOfficial
                        ? "bg-emerald-500/20 ring-1 ring-emerald-400/40"
                        : "bg-emerald-950/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="teamId"
                      value={team.id}
                      defaultChecked={bestThirdTeamIds.has(team.id)}
                      disabled={!editable}
                    />
                    <span>
                      Grupo {groupId}: {team.name}
                      {isOfficial && (
                        <span className="ml-2 text-xs text-emerald-300">✓ Oficial</span>
                      )}
                      {bestThirdTeamIds.has(team.id) && isOfficial && (
                        <span className="ml-1 text-xs text-amber-200">acierto</span>
                      )}
                    </span>
                  </label>
                );
              })}
              {editable && predictedThirdTeams.length >= 8 && (
                <div className="sm:col-span-2 lg:col-span-3">
                  <SubmitButton label="Guardar 8 mejores terceros" />
                </div>
              )}
              {editable && predictedThirdTeams.length < 8 && (
                <p className="sm:col-span-2 lg:col-span-3 text-sm text-amber-200">
                  Necesitas predecir el 3º de al menos 8 grupos para guardar esta sección.
                </p>
              )}
            </form>
          )}
        </Card>
      </div>
    </PageShell>
  );
}
