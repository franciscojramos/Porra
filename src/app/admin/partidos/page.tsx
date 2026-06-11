import Link from "next/link";
import { getAdminData } from "@/lib/data";
import { getMatchAwayName, getMatchHomeName, getMatchMeta } from "@/lib/matchDisplay";
import { PageShell, Card } from "@/components/ui";
import { MatchStage } from "@prisma/client";

const STAGE_LABELS: Record<MatchStage, string> = {
  GROUP: "Grupos",
  ROUND_32: "Dieciseisavos",
  ROUND_16: "Octavos",
  QUARTER: "Cuartos",
  SEMI: "Semifinales",
  THIRD_PLACE: "3.er puesto",
  FINAL: "Final",
};

export default async function AdminPartidosPage({
  searchParams,
}: {
  searchParams: { filtro?: string };
}) {
  const data = await getAdminData();
  const filtro = searchParams.filtro ?? "todos";

  const matches = data.matches.filter((match) => {
    const played = match.homeScore !== null && match.awayScore !== null;
    if (filtro === "pendientes") return !played;
    if (filtro === "jugados") return played;
    if (filtro === "grupos") return match.stage === "GROUP";
    if (filtro === "eliminatorias") return match.stage !== "GROUP";
    return true;
  });

  const filters = [
    { id: "todos", label: "Todos" },
    { id: "pendientes", label: "Pendientes" },
    { id: "jugados", label: "Jugados" },
    { id: "grupos", label: "Fase de grupos" },
    { id: "eliminatorias", label: "Eliminatorias" },
  ];

  return (
    <PageShell
      title="Resultados de partidos"
      subtitle="Introduce marcadores y goleadores. Al guardar se recalculan los puntos de la porra."
    >
      <Link
        href="/admin"
        className="mb-6 inline-block text-sm text-emerald-300 hover:underline"
      >
        ← Volver al panel admin
      </Link>

      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <Link
            key={f.id}
            href={f.id === "todos" ? "/admin/partidos" : `/admin/partidos?filtro=${f.id}`}
            className={`rounded-full px-3 py-1.5 text-sm ${
              filtro === f.id
                ? "bg-emerald-500 font-semibold text-emerald-950"
                : "border border-white/10 text-emerald-100 hover:bg-white/10"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <Card title={`${matches.length} partidos`}>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr className="text-emerald-300">
                <th>#</th>
                <th>Fase</th>
                <th>Partido</th>
                <th>Resultado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match) => {
                const played = match.homeScore !== null && match.awayScore !== null;
                return (
                  <tr key={match.id}>
                    <td>{match.matchNumber}</td>
                    <td className="text-sm">{STAGE_LABELS[match.stage]}</td>
                    <td>
                      <p className="font-medium text-white">
                        {getMatchHomeName(match, data.teamMap)} vs{" "}
                        {getMatchAwayName(match, data.teamMap)}
                      </p>
                      <p className="text-xs text-emerald-400">{getMatchMeta(match)}</p>
                    </td>
                    <td>
                      {played ? (
                        <span className="font-semibold text-emerald-300">
                          {match.homeScore} - {match.awayScore}
                        </span>
                      ) : (
                        <span className="text-emerald-500">Pendiente</span>
                      )}
                    </td>
                    <td>
                      <Link
                        href={`/admin/partidos/${match.matchNumber}`}
                        className="text-amber-300 hover:underline"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </PageShell>
  );
}
