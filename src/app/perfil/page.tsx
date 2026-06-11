import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getUserProfile } from "@/lib/data";
import { PageShell } from "@/components/ui";
import { DraftBanner, LockBanner } from "@/components/LockBanner";
import {
  ConfirmPhase1Card,
  ConfirmPhase2Card,
} from "@/components/ConfirmPredictionsCard";
import {
  ProfileLinks,
  UserProfilePredictions,
} from "@/components/UserProfilePredictions";

export default async function PerfilPage() {
  const session = await getSession();
  if (!session) redirect("/login");

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
          <ProfileLinks phase1Locked={false} phase2Locked={user.phase2Locked} />
          <div className="mt-6">
            <ConfirmPhase1Card userId={session.id} />
          </div>
        </>
      ) : (
        <LockBanner locked phase="phase1" />
      )}

      {user.phase1Locked && !user.phase2Locked && (
        <>
          <div className="mt-6">
            <DraftBanner phase="phase2" />
            <ProfileLinks phase1Locked phase2Locked={false} />
          </div>
          <div className="mt-6">
            <ConfirmPhase2Card userId={session.id} />
          </div>
        </>
      )}

      {user.phase2Locked && (
        <div className="mt-6">
          <LockBanner locked phase="phase2" />
        </div>
      )}

      <div className="mt-8">
        <UserProfilePredictions profile={profile} />
      </div>
    </PageShell>
  );
}
