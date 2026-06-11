import Link from "next/link";
import { notFound } from "next/navigation";
import { getMatchDetail } from "@/lib/dashboard";
import {
  formatMadridDateTime,
  STATUS_LABELS,
} from "@/lib/madridTime";
import { getMatchAwayName, getMatchHomeName, getMatchMeta } from "@/lib/matchDisplay";
import { PageShell, Card } from "@/components/ui";

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

  return (
    <PageShell
      title={`Partido #${match.matchNumber}`}
      subtitle={getMatchMeta(match)}
    >
      <Link
        href="/inicio"
        className="mb-6 inline-block text-sm text-emerald-300 hover:underline"
      >
        ← Volver a actualidad
      </Link>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Información del partido">
          <p className="mb-2 text-sm text-emerald-300">
            {STATUS_LABELS[match.status]}
          </p>
          <p className="text-3xl font-black text-white">
            {getMatchHomeName(match, teamMap)}{" "}
            {hasResult ? (
              <span className="text-emerald-300">
                {match.homeScore} - {match.awayScore}
              </span>
            ) : (
              <span className="text-emerald-400">vs</span>
            )}{" "}
            {getMatchAwayName(match, teamMap)}
          </p>
          <ul className="mt-4 space-y-1 text-sm text-emerald-100">
            <li>Hora (Madrid): {formatMadridDateTime(match.kickoffAt)}</li>
            {match.stadium && <li>Estadio: {match.stadium}</li>}
            {match.groupId && <li>Grupo {match.groupId}</li>}
          </ul>
          {hasResult && (match.scorersHome || match.scorersAway) && (
            <div className="mt-4 space-y-2 rounded-xl bg-emerald-950/40 p-3 text-sm">
              {match.scorersHome && (
                <p>
                  <strong>{getMatchHomeName(match, teamMap)}:</strong> {match.scorersHome}
                </p>
              )}
              {match.scorersAway && (
                <p>
                  <strong>{getMatchAwayName(match, teamMap)}:</strong> {match.scorersAway}
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
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr className="text-emerald-300">
                    <th>Jugador</th>
                    <th>Pronóstico</th>
                    <th>Puntos</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <Link
                          href={`/jugadores/${p.user.id}`}
                          className="text-emerald-200 hover:underline"
                        >
                          {p.user.displayName}
                        </Link>
                      </td>
                      <td>
                        {p.homeScore} - {p.awayScore}
                      </td>
                      <td className="font-bold text-emerald-300">
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
