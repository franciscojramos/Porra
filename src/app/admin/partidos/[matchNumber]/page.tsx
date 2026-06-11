import Link from "next/link";
import { notFound } from "next/navigation";
import { saveOfficialMatchAction } from "@/lib/actions";
import { getAdminData } from "@/lib/data";
import { getMatchAwayName, getMatchHomeName, getMatchMeta } from "@/lib/matchDisplay";
import { getPlayersByTeamCode } from "@/lib/players";
import { AdminMatchResultForm } from "@/components/AdminMatchResultForm";
import { PageShell, Card } from "@/components/ui";

export default async function AdminPartidoEditPage({
  params,
}: {
  params: { matchNumber: string };
}) {
  const matchNumber = Number(params.matchNumber);
  if (Number.isNaN(matchNumber)) notFound();

  const data = await getAdminData();
  const match = data.matches.find((m) => m.matchNumber === matchNumber);
  if (!match) notFound();

  const homeTeam = match.homeTeamId ? data.teamMap[match.homeTeamId] : null;
  const awayTeam = match.awayTeamId ? data.teamMap[match.awayTeamId] : null;
  const homePlayers = getPlayersByTeamCode(homeTeam?.code);
  const awayPlayers = getPlayersByTeamCode(awayTeam?.code);

  const homeName = getMatchHomeName(match, data.teamMap);
  const awayName = getMatchAwayName(match, data.teamMap);
  const hasTeams = homePlayers.length > 0 && awayPlayers.length > 0;

  return (
    <PageShell
      title={`Partido #${match.matchNumber}`}
      subtitle={getMatchMeta(match)}
    >
      <div className="mb-6 flex flex-wrap gap-4 text-sm">
        <Link href="/admin/partidos" className="text-emerald-300 hover:underline">
          ← Todos los partidos
        </Link>
        <Link href={`/partidos/${match.matchNumber}`} className="text-emerald-300 hover:underline">
          Ver página pública
        </Link>
      </div>

      <Card title={`${homeName} vs ${awayName}`}>
        {!hasTeams && (
          <p className="mb-4 rounded-xl bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
            Eliminatoria sin equipos definidos aún: los goleadores se escriben a mano. En fase de
            grupos puedes elegirlos de la plantilla.
          </p>
        )}

        <AdminMatchResultForm
          matchId={match.id}
          homeName={homeName}
          awayName={awayName}
          homePlayers={homePlayers}
          awayPlayers={awayPlayers}
          defaultHomeScore={match.homeScore}
          defaultAwayScore={match.awayScore}
          defaultScorersHome={match.scorersHome}
          defaultScorersAway={match.scorersAway}
          action={saveOfficialMatchAction}
        />

        {(match.scorersHome || match.scorersAway) && (
          <div className="mt-6 rounded-xl bg-emerald-950/40 p-3 text-sm text-emerald-100">
            <p className="mb-1 font-semibold text-emerald-300">Goleadores guardados</p>
            {match.scorersHome && (
              <p>
                <strong>{homeName}:</strong> {match.scorersHome}
              </p>
            )}
            {match.scorersAway && (
              <p>
                <strong>{awayName}:</strong> {match.scorersAway}
              </p>
            )}
          </div>
        )}
      </Card>
    </PageShell>
  );
}
