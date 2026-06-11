import Link from "next/link";
import { getHomeDashboard } from "@/lib/dashboard";
import {
  formatMadridDate,
  formatMadridDateTime,
  STATUS_LABELS,
} from "@/lib/madridTime";
import { getMatchAwayName, getMatchHomeName } from "@/lib/matchDisplay";
import { PageShell, Card } from "@/components/ui";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    live: "bg-red-500/20 text-red-200 animate-pulse",
    upcoming: "bg-amber-500/20 text-amber-200",
    finished: "bg-emerald-500/20 text-emerald-200",
    scheduled: "bg-white/10 text-emerald-100",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs ${colors[status] ?? colors.scheduled}`}>
      {STATUS_LABELS[status as keyof typeof STATUS_LABELS] ?? status}
    </span>
  );
}

export default async function InicioPage() {
  const data = await getHomeDashboard();
  const featured = data.featured;

  return (
    <PageShell
      title="Actualidad del Mundial"
      subtitle="Resultados reales, partidos por día (hora de Madrid) y clasificaciones de grupos."
    >
      {featured && (
        <Card title={data.liveMatch ? "En juego ahora" : "Próximo partido"}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <StatusBadge status={featured.status} />
                <span className="text-sm text-emerald-300">
                  Partido #{featured.matchNumber}
                </span>
              </div>
              <p className="text-2xl font-bold text-white">
                {getMatchHomeName(featured, data.teamMap)}{" "}
                {featured.homeScore !== null && featured.awayScore !== null ? (
                  <span className="text-emerald-300">
                    {featured.homeScore} - {featured.awayScore}
                  </span>
                ) : (
                  <span className="text-emerald-400">vs</span>
                )}{" "}
                {getMatchAwayName(featured, data.teamMap)}
              </p>
              <p className="mt-2 text-sm text-emerald-200">
                {formatMadridDateTime(featured.kickoffAt)}
                {featured.stadium ? ` · ${featured.stadium}` : ""}
              </p>
              {featured.homeScore !== null &&
                featured.awayScore !== null &&
                (featured.scorersHome || featured.scorersAway) && (
                  <div className="mt-3 space-y-1 text-sm text-emerald-200">
                    {featured.scorersHome && (
                      <p>
                        <strong>{getMatchHomeName(featured, data.teamMap)}:</strong>{" "}
                        {featured.scorersHome}
                      </p>
                    )}
                    {featured.scorersAway && (
                      <p>
                        <strong>{getMatchAwayName(featured, data.teamMap)}:</strong>{" "}
                        {featured.scorersAway}
                      </p>
                    )}
                  </div>
                )}
            </div>
            <Link
              href={`/partidos/${featured.matchNumber}`}
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950"
            >
              Ver detalle y porra
            </Link>
          </div>
        </Card>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <Card title="Clasificaciones reales (grupos)">
          <div className="max-h-[520px] space-y-4 overflow-y-auto">
            {data.groupStandings.map((group) => (
              <div key={group.groupId}>
                <h3 className="mb-2 text-sm font-semibold text-emerald-300">
                  Grupo {group.groupId}
                </h3>
                <table className="text-sm">
                  <thead>
                    <tr className="text-emerald-400">
                      <th>#</th>
                      <th>Equipo</th>
                      <th>PJ</th>
                      <th>Pts</th>
                      <th>DG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.rows.map((row) => (
                      <tr key={row.teamId}>
                        <td>{row.position}</td>
                        <td>{row.team?.name ?? "—"}</td>
                        <td>{row.played}</td>
                        <td className="font-semibold text-emerald-300">{row.points}</td>
                        <td>{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </Card>

        <Card title={`Partidos por día · ${data.totalFinished}/${data.totalMatches} finalizados`}>
          <div className="max-h-[520px] space-y-6 overflow-y-auto">
            {data.days.map(({ date, matches }) => (
              <div key={date}>
                <h3 className="mb-2 text-sm font-semibold capitalize text-emerald-300">
                  {formatMadridDate(new Date(date + "T12:00:00"))}
                </h3>
                <div className="space-y-2">
                  {matches.map((match) => (
                    <Link
                      key={match.id}
                      href={`/partidos/${match.matchNumber}`}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-emerald-950/40 px-3 py-2 text-sm transition hover:bg-emerald-950/60"
                    >
                      <div>
                        <span className="text-xs text-emerald-400">#{match.matchNumber}</span>{" "}
                        {getMatchHomeName(match, data.teamMap)}{" "}
                        {match.homeScore !== null ? (
                          <strong className="text-emerald-300">
                            {match.homeScore}-{match.awayScore}
                          </strong>
                        ) : (
                          "vs"
                        )}{" "}
                        {getMatchAwayName(match, data.teamMap)}
                        <p className="text-xs text-emerald-400">
                          {formatMadridDateTime(match.kickoffAt)}
                        </p>
                      </div>
                      <StatusBadge status={match.status} />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
