import {
  saveGroupPhase1Action,
  saveAllGruposPhase1Action,
} from "@/lib/actions";
import { getMatchAwayName, getMatchHomeName } from "@/lib/matchDisplay";
import { MatchMeta } from "@/components/MatchMeta";
import { OfficialGroupStanding } from "@/components/OfficialGroupStanding";
import { OfficialMatchResult } from "@/components/OfficialMatchResult";
import { Card, ScoreInput, SubmitButton, TeamSelect } from "@/components/ui";
import { formatTeamDisplay } from "@/lib/teamFlags";
import type { getGroupsWithData } from "@/lib/data";
import type { getOfficialResults } from "@/lib/official";

type GroupsData = Awaited<ReturnType<typeof getGroupsWithData>>;
type OfficialResults = Awaited<ReturnType<typeof getOfficialResults>>;

type Props = {
  data: GroupsData;
  official: OfficialResults;
  editable: boolean;
  userId?: string;
  compact?: boolean;
};

export function Phase1GruposForm({ data, official, editable, userId, compact }: Props) {
  const {
    groups,
    teamMap,
    matchPredictions,
    standingPredictions,
    bestThirdTeamIds,
    predictedThirdTeams,
  } = data;

  const saveAllAction = editable ? saveAllGruposPhase1Action : undefined;
  const saveGroupAction = editable ? saveGroupPhase1Action : undefined;

  return (
    <form action={saveAllAction} className="space-y-8">
      {userId && <input type="hidden" name="userId" value={userId} />}

      {official.hasThirds && !compact && (
        <Card title="8 mejores terceros oficiales">
          <ul className="flex flex-wrap gap-2">
            {official.officialThirdTeams.map((team) => (
              <li
                key={team.id}
                className="rounded-full bg-emerald-500/20 px-3 py-1 text-sm text-emerald-100"
              >
                {formatTeamDisplay(team.name, team.code, { showCode: true })}
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
            {!compact && (
              <div className="mb-4 flex flex-wrap gap-2">
                {group.teams.map((gt) => (
                  <span
                    key={gt.teamId}
                    className="rounded-full bg-emerald-950/50 px-3 py-1 text-xs text-emerald-100"
                  >
                    {gt.position}. {formatTeamDisplay(gt.team.name, gt.team.code)}
                  </span>
                ))}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-emerald-300">
                  Partidos
                </h3>
                <div className="grid gap-3">
                  {group.matches.map((match) => {
                    const prediction = matchPredictions[match.id];

                    return (
                      <div
                        key={match.id}
                        className="flex flex-col gap-2 rounded-xl bg-emerald-950/40 p-3"
                      >
                        <div className="flex flex-wrap items-center gap-3">
                          <MatchMeta match={match} />
                          <span className="min-w-0 flex-1 break-words font-medium sm:min-w-[100px] sm:flex-none">
                            {getMatchHomeName(match, teamMap)}
                          </span>
                          <ScoreInput
                            name={`score_${match.id}_home`}
                            label="Local"
                            defaultValue={prediction?.homeScore}
                            disabled={!editable}
                          />
                          <span className="text-emerald-300">-</span>
                          <ScoreInput
                            name={`score_${match.id}_away`}
                            label="Visit."
                            defaultValue={prediction?.awayScore}
                            disabled={!editable}
                          />
                          <span className="min-w-0 flex-1 break-words font-medium sm:min-w-[100px] sm:flex-none">
                            {getMatchAwayName(match, teamMap)}
                          </span>
                        </div>
                        {!compact && (
                          <OfficialMatchResult
                            match={match}
                            teamMap={teamMap}
                            prediction={prediction}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <TeamSelect
                  name={`standing_${group.id}_firstTeamId`}
                  label="1º puesto"
                  teams={teams}
                  defaultValue={standing?.firstTeamId}
                  disabled={!editable}
                />
                <TeamSelect
                  name={`standing_${group.id}_secondTeamId`}
                  label="2º puesto"
                  teams={teams}
                  defaultValue={standing?.secondTeamId}
                  disabled={!editable}
                />
                <TeamSelect
                  name={`standing_${group.id}_thirdTeamId`}
                  label="3º puesto"
                  teams={teams}
                  defaultValue={standing?.thirdTeamId}
                  disabled={!editable}
                />
                <TeamSelect
                  name={`standing_${group.id}_fourthTeamId`}
                  label="4º puesto"
                  teams={teams}
                  defaultValue={standing?.fourthTeamId}
                  disabled={!editable}
                />
              </div>

              {editable && saveGroupAction && (
                <div>
                  <button
                    type="submit"
                    formAction={saveGroupAction}
                    name="groupId"
                    value={group.id}
                    className="rounded-xl border border-emerald-400/50 bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/25"
                  >
                    Guardar grupo {group.id}
                  </button>
                </div>
              )}

              {officialStanding && !compact && (
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
          Elige <strong>8 de tus terceros predichos</strong> (uno por grupo) que crees que pasarán
          como mejores terceros.
        </p>
        {predictedThirdTeams.length === 0 ? (
          <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
            Aún no has predicho ningún 3º puesto. Rellena la clasificación de cada grupo arriba.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
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
                    Grupo {groupId}: {formatTeamDisplay(team.name, team.code)}
                    {isOfficial && (
                      <span className="ml-2 text-xs text-emerald-300">✓ Oficial</span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </Card>

      {editable && saveAllAction && (
        <div className="border-t border-white/10 pt-6">
          <SubmitButton label="Guardar todo" />
        </div>
      )}
    </form>
  );
}
