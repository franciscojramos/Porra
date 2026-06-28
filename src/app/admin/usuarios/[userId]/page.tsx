import Link from "next/link";
import { notFound } from "next/navigation";
import {
  saveMatchPredictionAction,
  unlockUserPhase1Action,
  unlockUserPhase2Action,
  completeUserPhase1Action,
  changeUserPasswordAction,
} from "@/lib/actions";
import { getUserProfile } from "@/lib/data";
import { getOfficialResults } from "@/lib/official";
import { getMatchMeta } from "@/lib/matchDisplay";
import {
  buildOfficialKnockoutSlots,
  getKnockoutMatchAwayName,
  getKnockoutMatchHomeName,
} from "@/lib/knockoutDisplay";
import { AdminEditBanner } from "@/components/LockBanner";
import { Phase1AwardsForm } from "@/components/Phase1AwardsForm";
import { Phase1GruposForm } from "@/components/Phase1GruposForm";
import { HonorBracketForm } from "@/components/HonorBracketForm";
import { PageShell, Card, ScoreInput, SubmitButton } from "@/components/ui";
import { MatchStage } from "@prisma/client";

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
  const [profile, official] = await Promise.all([
    getUserProfile(params.userId, { adminEdit: true }),
    getOfficialResults(),
  ]);
  if (!profile) notFound();

  const { user, groupsData, knockoutData, awardsData } = profile;

  const knockoutSlots = buildOfficialKnockoutSlots(
    knockoutData.matches,
    knockoutData.officialStandings,
    knockoutData.officialBestThirdIds,
    knockoutData.officialWinners,
    knockoutData.officialLosers
  );

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

      <Card title="Cambiar contraseña">
        <form action={changeUserPasswordAction} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="userId" value={user.id} />
          <label className="flex flex-col gap-1 text-sm text-emerald-100">
            <span>Nueva contraseña para <strong>{user.displayName}</strong></span>
            <input
              type="text"
              name="newPassword"
              placeholder="Nueva contraseña"
              required
              minLength={3}
              className="rounded-lg border border-white/10 bg-emerald-950 px-3 py-2 text-white"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-amber-400"
          >
            Cambiar contraseña
          </button>
        </form>
        <p className="mt-2 text-xs text-emerald-300">
          El usuario podrá iniciar sesión con esta nueva contraseña inmediatamente.
        </p>
      </Card>

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
        {user.phase2Locked && (
          <form action={unlockUserPhase2Action}>
            <input type="hidden" name="userId" value={user.id} />
            <button
              type="submit"
              className="rounded-xl border border-amber-400 px-4 py-2 text-sm text-amber-200"
            >
              Desbloquear Fase 2 (antiguo)
            </button>
          </form>
        )}
      </div>

      {(user.phase1Locked || user.phase2Locked) && (
        <div className="mb-6 rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Estado: Fase 1 {user.phase1Locked ? "enviada" : "borrador"} · Fase 2 por ronda
          {user.phase2Locked ? " (bloqueo manual antiguo activo)" : ""}. Solo tú (admin) puedes
          editar desde aquí.
        </div>
      )}

      <div className="space-y-8">
        <Phase1GruposForm
          data={groupsData}
          official={official}
          editable
          userId={user.id}
          compact
        />

        <HonorBracketForm
          teams={knockoutData.teams}
          teamMap={knockoutData.teamMap}
          finalBracket={knockoutData.finalBracket}
          editable
          locked={user.finalBracketLocked}
          lockedAt={user.finalBracketLockedAt}
          userId={user.id}
          adminEdit
        />

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
                    <span>{getKnockoutMatchHomeName(match, knockoutData.teamMap, knockoutSlots)}</span>
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
                    <span>{getKnockoutMatchAwayName(match, knockoutData.teamMap, knockoutSlots)}</span>
                    <SubmitButton label="OK" />
                  </form>
                );
              })}
            </Card>
          );
        })}

        <Phase1AwardsForm
          awardsData={awardsData}
          official={official}
          editable
          userId={user.id}
        />
      </div>
    </PageShell>
  );
}
