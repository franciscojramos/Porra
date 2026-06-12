import Link from "next/link";
import { PageShell, Card } from "@/components/ui";
import { getLeaderboard } from "@/lib/scoring";

export default async function ClasificacionPage() {
  const users = await getLeaderboard();

  return (
    <PageShell
      title="Clasificación porra"
      subtitle="Ranking por puntos totales. Entra en cada perfil para ver el desglose."
    >
      <Card>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr className="text-emerald-200">
                <th>#</th>
                <th>Jugador</th>
                <th className="text-right">Puntos</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} className="text-white">
                  <td>{index + 1}</td>
                  <td className="font-semibold">{user.displayName}</td>
                  <td className="text-right text-lg font-bold text-emerald-300">
                    {user.score?.totalPoints ?? 0}
                  </td>
                  <td className="text-right">
                    <Link
                      href={`/jugadores/${user.id}`}
                      className="inline-block rounded-lg border border-emerald-400/40 bg-emerald-500/15 px-3 py-1.5 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/25"
                    >
                      Ver perfil
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageShell>
  );
}
