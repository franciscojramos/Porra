import { getKnockoutMatches } from "@/lib/data";
import { getOfficialResults } from "@/lib/official";
import { LockBanner, DraftBanner } from "@/components/LockBanner";
import { Phase2Banner } from "@/components/Phase2Banner";
import { KnockoutBracketView } from "@/components/KnockoutBracketView";
import { PageShell, Card } from "@/components/ui";

function teamName(
  teamMap: Record<string, { name: string } | undefined>,
  id: string | null | undefined
) {
  if (!id) return "—";
  return teamMap[id]?.name ?? "—";
}

export default async function EliminatoriasPage() {
  const [knockout, official] = await Promise.all([
    getKnockoutMatches(),
    getOfficialResults(),
  ]);
  const {
    matches,
    teamMap,
    predictions,
    phase,
    locked,
    editable,
    stageLabels,
    userStandings,
    userBestThirdIds,
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
      { homeScore: p.homeScore, awayScore: p.awayScore },
    ])
  );

  const serializedTeamMap = Object.fromEntries(
    Object.entries(teamMap).map(([id, t]) => [id, { id: t.id, name: t.name, code: t.code }])
  );

  return (
    <PageShell
      title="Eliminatorias · Fase 2"
      subtitle="Marcadores sobre 90' o 120' (antes de penaltis). El cuadro de honor se deduce de tu llave."
    >
      <LockBanner locked={locked} phase="phase2" />
      {!locked && editable && <DraftBanner phase="phase2" />}
      <div className="mb-8">
        <Phase2Banner phase={phase} />
      </div>

      {official.officialFinalBracket?.championTeamId && (
        <Card title="Cuadro de honor oficial" className="mb-8">
          <p className="text-sm text-emerald-100">
            🏆 {teamName(teamMap, official.officialFinalBracket.championTeamId)} · 🥈{" "}
            {teamName(teamMap, official.officialFinalBracket.runnerUpTeamId)}
          </p>
        </Card>
      )}

      {phase.phase2Open ? (
        <Card title="Tu llave de eliminatorias">
          <p className="mb-6 text-sm text-emerald-100">
            Edita los marcadores y observa cómo el ganador de cada partido avanza al siguiente
            cruce. Los equipos de dieciseisavos salen de tu Fase 1 (grupos + 8 terceros).
          </p>
          <KnockoutBracketView
            matches={serializedMatches}
            teamMap={serializedTeamMap}
            initialPredictions={initialPredictions}
            userStandings={userStandings}
            userBestThirdIds={userBestThirdIds}
            editable={editable}
            stageLabels={stageLabels}
          />
        </Card>
      ) : (
        <Card title="Llave pendiente">
          <p className="text-sm text-emerald-200">
            La llave interactiva estará disponible cuando el administrador cierre la fase de grupos
            y publique los 8 mejores terceros oficiales.
          </p>
        </Card>
      )}
    </PageShell>
  );
}
