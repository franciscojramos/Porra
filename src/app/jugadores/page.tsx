import Link from "next/link";
import { getAllUsers } from "@/lib/data";
import { PageShell, Card } from "@/components/ui";

export default async function JugadoresPage() {
  const users = await getAllUsers();

  return (
    <PageShell
      title="Jugadores"
      subtitle="Consulta los pronósticos de cada participante de la porra."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Link key={user.id} href={`/jugadores/${user.id}`}>
            <Card className="transition hover:border-emerald-400/40 hover:bg-white/10">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-white">{user.displayName}</h2>
                  <p className="text-sm text-emerald-200">@{user.username}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-300">
                    {user.score?.totalPoints ?? 0}
                  </p>
                  <p className="text-xs text-emerald-400">puntos</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-emerald-300">
                F1 {user.phase1Locked ? "✓" : "…"} · F2 {user.phase2Locked ? "✓" : "…"}
                {user.isAdmin ? " · Admin" : ""}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
