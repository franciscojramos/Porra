import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getUserProfile } from "@/lib/data";
import { PageShell } from "@/components/ui";
import { UserProfilePredictions } from "@/components/UserProfilePredictions";

export default async function JugadorProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  const profile = await getUserProfile(params.id);

  if (!profile) notFound();

  const isOwn = session?.id === profile.user.id;

  return (
    <PageShell
      title={profile.user.displayName}
      subtitle={
        profile.user.phase1Locked && profile.user.phase2Locked
          ? "Fase 1 y Fase 2 enviadas"
          : profile.user.phase1Locked
            ? "Fase 1 enviada · Fase 2 en borrador"
            : "Fase 1 en borrador"
      }
    >
      <div className="mb-6 flex flex-wrap gap-3">
        <Link
          href="/jugadores"
          className="rounded-full border border-white/20 px-4 py-1.5 text-sm text-emerald-100 hover:bg-white/10"
        >
          ← Todos los jugadores
        </Link>
        {isOwn && (
          <Link
            href="/perfil"
            className="rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-emerald-950"
          >
            Mi perfil
          </Link>
        )}
        {session?.isAdmin && !isOwn && (
          <Link
            href={`/admin/usuarios/${profile.user.id}`}
            className="rounded-full bg-amber-500 px-4 py-1.5 text-sm font-semibold text-emerald-950"
          >
            Editar como admin
          </Link>
        )}
      </div>
      <UserProfilePredictions profile={profile} />
    </PageShell>
  );
}
