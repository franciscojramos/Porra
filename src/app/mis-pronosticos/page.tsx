import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAwardsData, getGroupsWithData, getKnockoutMatches } from "@/lib/data";
import { getOfficialResults } from "@/lib/official";
import { LockBanner, DraftBanner } from "@/components/LockBanner";
import { Phase2Banner } from "@/components/Phase2Banner";
import { KnockoutRoundBanner } from "@/components/KnockoutRoundBanner";
import { HonorBracketForm } from "@/components/HonorBracketForm";
import { KnockoutBracketView } from "@/components/KnockoutBracketView";
import { MisPronosticosTabs, type MisPronosticosTab } from "@/components/MisPronosticosTabs";
import { Phase1AwardsForm } from "@/components/Phase1AwardsForm";
import { Phase1GruposForm } from "@/components/Phase1GruposForm";
import { PageShell, Card } from "@/components/ui";
import { formatTeamDisplay } from "@/lib/teamFlags";

function teamName(
  teamMap: Record<string, { name: string; code: string } | undefined>,
  id: string | null | undefined
) {
  if (!id) return "—";
  const team = teamMap[id];
  if (!team) return "—";
  return formatTeamDisplay(team.name, team.code);
}

function parseTab(value: string | undefined): MisPronosticosTab {
  if (value === "eliminatorias" || value === "premios") return value;
  return "grupos";
}

export default async function MisPronosticosPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.isAdmin) redirect("/admin");

  const tab = parseTab(searchParams.tab);

  const [groupsData, awardsData, knockout, official] = await Promise.all([
    getGroupsWithData(),
    getAwardsData(),
    getKnockoutMatches(),
    getOfficialResults(),
  ]);

  const {
    matches,
    teamMap,
    predictions,
    phase,
    locked: phase2Locked,
    editable: knockoutEditable,
    editableStages,
    stageEditStates,
    officialWinners,
    officialLosers,
    stageLabels,
    userStandings,
    userBestThirdIds,
    officialStandings,
    officialBestThirdIds,
    finalBracket,
    finalBracketLocked,
    finalBracketLockedAt,
    honorBracketEditable,
    teams,
  } = knockout;

  const serializedMatches = matches.map((m) => ({
    id: m.id,
    matchNumber: m.matchNumber,
    stage: m.stage,
    homeLabel: m.homeLabel,
    awayLabel: m.awayLabel,
    homeTeamId: m.homeTeamId,
    awayTeamId: m.awayTeamId,
    kickoffAt: m.kickoffAt?.toISOString() ?? null,
    stadium: m.stadium,
  }));

  const initialPredictions = Object.fromEntries(
    Object.entries(predictions).map(([id, p]) => [
      id,
      {
        homeScore: p.homeScore,
        awayScore: p.awayScore,
        advancesTeamId: p.advancesTeamId,
      },
    ])
  );

  const serializedTeamMap = Object.fromEntries(
    Object.entries(teamMap).map(([id, t]) => [id, { id: t.id, name: t.name, code: t.code }])
  );

  return (
    <PageShell
      title="Mis pronósticos"
      subtitle="Grupos, eliminatorias y premios en un solo sitio."
    >
      <MisPronosticosTabs
        initialTab={tab}
        panels={{
          grupos: (
            <div className="space-y-4">
              <LockBanner locked={groupsData.phase1Locked} phase="phase1" />
              {!groupsData.phase1Locked && groupsData.editable && (
                <DraftBanner phase="phase1" />
              )}
              <Phase1GruposForm
                data={groupsData}
                official={official}
                editable={groupsData.editable}
              />
            </div>
          ),
          eliminatorias: (
            <div className="space-y-4">
              <LockBanner locked={phase2Locked} phase="phase2" />
              {!phase2Locked && knockoutEditable && <DraftBanner phase="phase2" />}
              <Phase2Banner phase={phase} />
              {phase.phase2Open && (
                <KnockoutRoundBanner phase={phase} stageEditStates={stageEditStates} />
              )}
              {official.officialFinalBracket?.championTeamId && (
                <Card title="Cuadro de honor oficial">
                  <p className="text-sm text-emerald-100">
                    🏆 {teamName(teamMap, official.officialFinalBracket.championTeamId)} · 🥈{" "}
                    {teamName(teamMap, official.officialFinalBracket.runnerUpTeamId)}
                  </p>
                </Card>
              )}
              {phase.phase2Open ? (
                <>
                  <HonorBracketForm
                    teams={teams}
                    teamMap={teamMap}
                    finalBracket={finalBracket}
                    editable={honorBracketEditable}
                    locked={finalBracketLocked}
                    lockedAt={finalBracketLockedAt}
                  />
                  <Card title="Tu llave de eliminatorias">
                  <p className="mb-6 text-sm text-emerald-100">
                    Edita los marcadores y observa cómo el ganador de cada partido avanza al
                    siguiente cruce. Pulsa <strong>Guardar todo</strong> al terminar.
                  </p>
                  <KnockoutBracketView
                    matches={serializedMatches}
                    teamMap={serializedTeamMap}
                    initialPredictions={initialPredictions}
                    userStandings={userStandings}
                    userBestThirdIds={userBestThirdIds}
                    officialStandings={officialStandings}
                    officialBestThirdIds={officialBestThirdIds}
                    editable={knockoutEditable}
                    editableStages={editableStages}
                    stageEditStates={stageEditStates}
                    officialWinners={officialWinners}
                    officialLosers={officialLosers}
                    stageLabels={stageLabels}
                  />
                </Card>
                </>
              ) : (
                <Card title="Llave pendiente">
                  <p className="text-sm text-emerald-200">
                    La llave estará disponible cuando se cierre la fase de grupos y se publiquen
                    los 8 mejores terceros oficiales.
                  </p>
                </Card>
              )}
            </div>
          ),
          premios: (
            <div className="space-y-4">
              <LockBanner locked={awardsData.phase1Locked} phase="phase1" />
              {!awardsData.phase1Locked && awardsData.editable && (
                <DraftBanner phase="phase1" />
              )}
              <Phase1AwardsForm
                awardsData={awardsData}
                official={official}
                editable={awardsData.editable}
              />
            </div>
          ),
        }}
      />
    </PageShell>
  );
}
