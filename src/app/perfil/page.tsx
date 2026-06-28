import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getUserProfile } from "@/lib/data";
import { PageShell } from "@/components/ui";
import { DraftBanner, LockBanner } from "@/components/LockBanner";
import {
  ConfirmPhase1Card,
  Phase2InfoCard,
} from "@/components/ConfirmPredictionsCard";
import {
  ProfileLinks,
  UserProfilePredictions,
} from "@/components/UserProfilePredictions";

export default async function PerfilPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.isAdmin) redirect("/admin");

  const profile = await getUserProfile(session.id);
  if (!profile) redirect("/login");

  const { user } = profile;

  return (
    <PageShell
      title="Mi perfil"
      subtitle="Todo lo que has pronosticado: partidos, grupos, mejores terceros, eliminatorias y premios."
    >
      {!user.phase1Locked ? (
        <>
          <DraftBanner phase="phase1" />
          <ProfileLinks phase1Locked={false} />
          <div className="mt-6">
            <ConfirmPhase1Card userId={session.id} />
          </div>
        </>
      ) : (
        <LockBanner locked phase="phase1" />
      )}

      {user.phase1Locked && (
        <div className="mt-6 space-y-4">
          <ProfileLinks phase1Locked />
          <Phase2InfoCard userId={session.id} />
        </div>
      )}

      <div className="mt-8">
        <UserProfilePredictions profile={profile} />
      </div>
    </PageShell>
  );
}
