import Link from "next/link";
import { PageShell, Card } from "@/components/ui";
import { getLeaderboard } from "@/lib/scoring";

export default async function ClasificacionPage() {
  const users = await getLeaderboard();

  return (
    <PageShell
      title="Clasificación porra"
      subtitle="Ranking por puntos. Pulsa en un jugador para ver todos sus pronósticos."
    >
      <Card>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr className="text-emerald-200">
                <th>#</th>
                <th>Jugador</th>
                <th>Partidos</th>
                <th>Grupos</th>
                <th>3º mej.</th>
                <th>Premios</th>
                <th>Honor</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} className="text-white">
                  <td>{index + 1}</td>
                  <td className="font-semibold">{user.displayName}</td>
                  <td>{user.score?.matchPoints ?? 0}</td>
                  <td>{user.score?.standingPoints ?? 0}</td>
                  <td>{user.score?.bestThirdPoints ?? 0}</td>
                  <td>{user.score?.awardPoints ?? 0}</td>
                  <td>{user.score?.bracketPoints ?? 0}</td>
                  <td className="text-lg font-bold text-emerald-300">
                    {user.score?.totalPoints ?? 0}
                  </td>
                  <td>
                    <Link
                      href={`/jugadores/${user.id}`}
                      className="text-sm text-emerald-300 hover:underline"
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
