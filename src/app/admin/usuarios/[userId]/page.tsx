import Link from "next/link";
import { notFound } from "next/navigation";
import {
  saveMatchPredictionAction,
  saveStandingPredictionAction,
  saveBestThirdAction,
  saveAwardPredictionAction,
  unlockUserPhase1Action,
  unlockUserPhase2Action,
  completeUserPhase1Action,
  completeUserPhase2Action,
} from "@/lib/actions";
import { getUserProfile } from "@/lib/data";
import { getMatchAwayName, getMatchHomeName, getMatchMeta } from "@/lib/matchDisplay";
import { AdminEditBanner } from "@/components/LockBanner";
import { AwardPredictionForm } from "@/components/AwardPredictionForm";
import { PageShell, Card, ScoreInput, SubmitButton, TeamSelect } from "@/components/ui";
import { AwardCategory, MatchStage } from "@prisma/client";

const AWARDS: { category: AwardCategory; title: string; hasPodium: boolean }[] = [
  { category: "GOLDEN_BALL", title: "Balón de Oro", hasPodium: false },
  { category: "GOLDEN_BOOT", title: "Bota de Oro", hasPodium: true },
  { category: "GOLDEN_GLOVE", title: "Guante de Oro", hasPodium: false },
  { category: "BEST_YOUNG", title: "Mejor jugador joven", hasPodium: false },
];

const stageOrder: MatchStage[] = [
  MatchStage.ROUND_32,
  MatchStage.ROUND_16,
  MatchStage.QUARTER,
  MatchStage.SEMI,
  MatchStage.THIRD_PLACE,
  MatchStage.FINAL,
];

export default async function AdminUserEditPage({
  params,
}: {
  params: { userId: string };
}) {
  const profile = await getUserProfile(params.userId, { adminEdit: true });
  if (!profile) notFound();

  const { user, groupsData, knockoutData, awardsData } = profile;
  const {
    groups,
    teamMap,
    matchPredictions,
    standingPredictions,
    bestThirdTeamIds,
    predictedThirdTeams,
  } = groupsData;

  return (
    <PageShell
      title={`Editar: ${user.displayName}`}
      subtitle="Como administrador puedes modificar los pronósticos de este usuario."
    >
      <div className="mb-6 flex flex-wrap gap-3">
        <Link
          href="/admin"
          className="rounded-full border border-white/20 px-4 py-1.5 text-sm text-emerald-100"
        >
          ← Admin
        </Link>
        <Link
          href={`/jugadores/${user.id}`}
          className="rounded-full border border-white/20 px-4 py-1.5 text-sm text-emerald-100"
        >
          Ver perfil público
        </Link>
      </div>

      <AdminEditBanner displayName={user.displayName} />

      <div className="mb-6 flex flex-wrap gap-3">
        {!user.phase1Locked ? (
          <form action={completeUserPhase1Action}>
            <input type="hidden" name="userId" value={user.id} />
            <button
              type="submit"
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950"
            >
              Enviar Fase 1
            </button>
          </form>
        ) : (
          <form action={unlockUserPhase1Action}>
            <input type="hidden" name="userId" value={user.id} />
            <button
              type="submit"
              className="rounded-xl border border-amber-400 px-4 py-2 text-sm text-amber-200"
            >
              Desbloquear Fase 1
            </button>
          </form>
        )}
        {!user.phase2Locked ? (
          <form action={completeUserPhase2Action}>
            <input type="hidden" name="userId" value={user.id} />
            <button
              type="submit"
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950"
            >
              Enviar Fase 2
            </button>
          </form>
        ) : (
          <form action={unlockUserPhase2Action}>
            <input type="hidden" name="userId" value={user.id} />
            <button
              type="submit"
              className="rounded-xl border border-amber-400 px-4 py-2 text-sm text-amber-200"
            >
              Desbloquear Fase 2
            </button>
          </form>
        )}
      </div>

      {(user.phase1Locked || user.phase2Locked) && (
        <div className="mb-6 rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Estado: Fase 1 {user.phase1Locked ? "enviada" : "borrador"} · Fase 2{" "}
          {user.phase2Locked ? "enviada" : "borrador"}. Solo tú (admin) puedes editar desde aquí.
        </div>
      )}

      <div className="space-y-8">
        {groups.map((group) => {
          const teams = group.teams.map((gt) => gt.team);
          const standing = standingPredictions[group.id];

          return (
            <Card key={group.id} title={`Grupo ${group.id}`}>
              <div className="space-y-4">
                {group.matches.map((match) => {
                  const prediction = matchPredictions[match.id];

                  return (
                    <form
                      key={match.id}
                      action={saveMatchPredictionAction}
                      className="flex flex-wrap items-center gap-2 rounded-lg bg-emerald-950/40 p-2 text-sm"
                    >
                      <input type="hidden" name="userId" value={user.id} />
                      <input type="hidden" name="matchId" value={match.id} />
                      <span className="w-full text-xs text-emerald-400">{getMatchMeta(match)}</span>
                      <span>{getMatchHomeName(match, teamMap)}</span>
                      <ScoreInput
                        name="homeScore"
                        label="L"
                        defaultValue={prediction?.homeScore}
                      />
                      <span>-</span>
                      <ScoreInput
                        name="awayScore"
                        label="V"
                        defaultValue={prediction?.awayScore}
                      />
                      <span>{getMatchAwayName(match, teamMap)}</span>
                      <SubmitButton label="OK" />
                    </form>
                  );
                })}

                <form
                  action={saveStandingPredictionAction}
                  className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
                >
                  <input type="hidden" name="userId" value={user.id} />
                  <input type="hidden" name="groupId" value={group.id} />
                  <TeamSelect
                    name="firstTeamId"
                    label="1º"
                    teams={teams}
                    defaultValue={standing?.firstTeamId}
                  />
                  <TeamSelect
                    name="secondTeamId"
                    label="2º"
                    teams={teams}
                    defaultValue={standing?.secondTeamId}
                  />
                  <TeamSelect
                    name="thirdTeamId"
                    label="3º"
                    teams={teams}
                    defaultValue={standing?.thirdTeamId}
                  />
                  <TeamSelect
                    name="fourthTeamId"
                    label="4º"
                    teams={teams}
                    defaultValue={standing?.fourthTeamId}
                  />
                  <div className="md:col-span-2 xl:col-span-4">
                    <SubmitButton label="Guardar clasificación" />
                  </div>
                </form>
              </div>
            </Card>
          );
        })}

        <Card title="8 mejores terceros">
          <form action={saveBestThirdAction} className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <input type="hidden" name="userId" value={user.id} />
            {predictedThirdTeams.map(({ groupId, team }) => (
              <label key={team.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="teamId"
                  value={team.id}
                  defaultChecked={bestThirdTeamIds.has(team.id)}
                />
                Grupo {groupId}: {team.name}
              </label>
            ))}
            <div className="sm:col-span-2 lg:col-span-3">
              <SubmitButton label="Guardar mejores terceros" />
            </div>
          </form>
        </Card>

        {stageOrder.map((stage) => {
          const stageMatches = knockoutData.matches.filter((m) => m.stage === stage);
          if (stageMatches.length === 0) return null;

          return (
            <Card key={stage} title={knockoutData.stageLabels[stage]}>
              {stageMatches.map((match) => {
                const prediction = knockoutData.predictions[match.id];

                return (
                  <form
                    key={match.id}
                    action={saveMatchPredictionAction}
                    className="mb-2 flex flex-wrap items-center gap-2 rounded-lg bg-emerald-950/40 p-2 text-sm"
                  >
                    <input type="hidden" name="userId" value={user.id} />
                    <input type="hidden" name="matchId" value={match.id} />
                    <span className="w-full text-xs text-emerald-400">{getMatchMeta(match)}</span>
                    <span>{getMatchHomeName(match, knockoutData.teamMap)}</span>
                    <ScoreInput
                      name="homeScore"
                      label="L"
                      defaultValue={prediction?.homeScore}
                    />
                    <span>-</span>
                    <ScoreInput
                      name="awayScore"
                      label="V"
                      defaultValue={prediction?.awayScore}
                    />
                    <span>{getMatchAwayName(match, knockoutData.teamMap)}</span>
                    <SubmitButton label="OK" />
                  </form>
                );
              })}
            </Card>
          );
        })}

        <Card title="Premios">
          <div className="grid gap-4 lg:grid-cols-2">
            {AWARDS.map((award) => (
              <div key={award.category} className="rounded-xl bg-emerald-950/30 p-4">
                <h3 className="mb-3 font-semibold">{award.title}</h3>
                <AwardPredictionForm
                  award={award}
                  prediction={awardsData.predictions[award.category]}
                  action={saveAwardPredictionAction}
                  editable
                  hiddenFields={{ userId: user.id }}
                />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
