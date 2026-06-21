import Link from "next/link";
import { notFound } from "next/navigation";
import { getMatchDetail } from "@/lib/dashboard";
import {
  formatMadridDateTime,
  STATUS_LABELS,
} from "@/lib/madridTime";
import { getMatchAwayName, getMatchHomeName } from "@/lib/matchDisplay";
import { MatchMetaBadges } from "@/components/MatchMetaBadges";
import { MatchScoreboard } from "@/components/MatchScoreboard";
import { PageShell, Card } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { AdminMatchResultForm } from "@/components/AdminMatchResultForm";
import { saveOfficialMatchAction } from "@/lib/actions";
import { getPlayersByTeamCode } from "@/lib/players";

export default async function PartidoPage({
  params,
}: {
  params: { matchNumber: string };
}) {
  const matchNumber = Number(params.matchNumber);
  if (Number.isNaN(matchNumber)) notFound();

  const data = await getMatchDetail(matchNumber);
  if (!data) notFound();

  const { match, teamMap, predictions } = data;
  const hasResult = match.homeScore !== null && match.awayScore !== null;

  const homeName = getMatchHomeName(match, teamMap);
  const awayName = getMatchAwayName(match, teamMap);

  // Verificar si el usuario es admin
  const session = await getSession();
  const isAdmin = session?.isAdmin ?? false;

  // Obtener plantillas para los equipos si es admin
  const homeTeam = match.homeTeamId ? teamMap[match.homeTeamId] : null;
  const awayTeam = match.awayTeamId ? teamMap[match.awayTeamId] : null;
  const homePlayers = isAdmin ? getPlayersByTeamCode(homeTeam?.code) : [];
  const awayPlayers = isAdmin ? getPlayersByTeamCode(awayTeam?.code) : [];

  return (
    <PageShell title={`Partido #${match.matchNumber}`}>
      <MatchMetaBadges match={match} className="mb-4" />
      <Link
        href="/inicio"
        className="mb-6 inline-block text-sm text-emerald-300 hover:underline"
      >
        ← Volver a actualidad
      </Link>

      {isAdmin && (
        <div className="mb-6">
          <Card title="🔧 Admin: Editar resultado oficial">
            <p className="mb-4 text-xs text-emerald-400">
              Puedes actualizar el resultado directamente desde aquí.
            </p>
            <AdminMatchResultForm
              matchId={match.id}
              homeName={homeName}
              awayName={awayName}
              homeTeamId={match.homeTeamId}
              awayTeamId={match.awayTeamId}
              isKnockout={match.stage !== "GROUP"}
              homePlayers={homePlayers}
              awayPlayers={awayPlayers}
              defaultHomeScore={match.homeScore}
              defaultAwayScore={match.awayScore}
              defaultWinnerTeamId={match.winnerTeamId}
              defaultScorersHome={match.scorersHome}
              defaultScorersAway={match.scorersAway}
              defaultOwnGoalsHome={match.ownGoalsHome}
              defaultOwnGoalsAway={match.ownGoalsAway}
              action={saveOfficialMatchAction}
              redirectUrl={`/partidos/${match.matchNumber}`}
            />
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Información del partido">
          <p className="mb-2 text-sm text-emerald-300">
            {STATUS_LABELS[match.status]}
          </p>
          <MatchScoreboard
            homeName={homeName}
            awayName={awayName}
            homeScore={match.homeScore}
            awayScore={match.awayScore}
          />
          <ul className="mt-4 space-y-1 text-sm text-emerald-100">
            <li className="break-words">Hora (Madrid): {formatMadridDateTime(match.kickoffAt)}</li>
            {match.stadium && <li className="break-words">Estadio: {match.stadium}</li>}
            {match.groupId && <li>Grupo {match.groupId}</li>}
          </ul>
          {hasResult && (match.scorersHome || match.scorersAway || match.ownGoalsHome || match.ownGoalsAway) && (
            <div className="mt-4 space-y-2 rounded-xl bg-emerald-950/40 p-3 text-sm">
              {match.scorersHome && (
                <p className="break-words">
                  <strong>{homeName}:</strong> {match.scorersHome}
                </p>
              )}
              {match.scorersAway && (
                <p className="break-words">
                  <strong>{awayName}:</strong> {match.scorersAway}
                </p>
              )}
              {match.ownGoalsHome && (
                <p className="break-words text-amber-200">
                  <strong>⚽ Autogoles a favor de {homeName}:</strong> {match.ownGoalsHome}
                </p>
              )}
              {match.ownGoalsAway && (
                <p className="break-words text-amber-200">
                  <strong>⚽ Autogoles a favor de {awayName}:</strong> {match.ownGoalsAway}
                </p>
              )}
            </div>
          )}
          {!hasResult && (
            <p className="mt-4 text-sm text-emerald-200">
              El admin introducirá el resultado y los goleadores cuando termine el partido.
            </p>
          )}
        </Card>

        <Card title="Porra · Pronósticos y puntos">
          {predictions.length === 0 ? (
            <p className="text-sm text-emerald-200">Nadie ha pronosticado este partido aún.</p>
          ) : (
            <div className="-mx-1 overflow-x-auto sm:mx-0">
              <table className="min-w-[240px]">
                <thead>
                  <tr className="text-emerald-300">
                    <th className="w-[45%]">Jugador</th>
                    <th>Pronóstico</th>
                    <th className="text-right">Puntos</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((p) => (
                    <tr key={p.id}>
                      <td className="break-words">
                        <Link
                          href={`/jugadores/${p.user.id}`}
                          className="text-emerald-200 hover:underline"
                        >
                          {p.user.displayName}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap tabular-nums">
                        {p.homeScore} - {p.awayScore}
                      </td>
                      <td className="text-right font-bold text-emerald-300">
                        {hasResult ? p.points : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {hasResult && (
            <p className="mt-4 text-xs text-emerald-400">
              Los puntos se calculan al guardar el resultado oficial en Admin.
            </p>
          )}
        </Card>
      </div>
    </PageShell>
  );
}
