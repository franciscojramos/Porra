import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getTournamentPhaseState } from "@/lib/tournamentPhase";
import { NavBarMenu } from "@/components/NavBarMenu";

export async function NavBar() {
  const session = await getSession();
  if (!session) return null;

  const [user, phase] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.id },
      select: { phase1Locked: true, phase2Locked: true },
    }),
    getTournamentPhaseState(),
  ]);

  const phase1Locked = user?.phase1Locked ?? false;
  const phase2Locked = user?.phase2Locked ?? false;
  const canEditGroups = !phase1Locked;
  const canEditKnockout = phase.knockoutWindowOpen && !phase2Locked;

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-emerald-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:py-4">
        <div className="min-w-0 flex-1">
          <Link href="/inicio" className="block truncate text-base font-bold text-white md:text-lg">
            Porra Mundial 2026
          </Link>
          <p className="hidden truncate text-sm text-emerald-200 sm:block">
            Hola, {session.displayName}
            <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">
              F1 {phase1Locked ? "✓" : "…"}
            </span>
            <span className="ml-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">
              F2 {phase2Locked ? "✓" : phase.knockoutWindowOpen ? "…" : "—"}
            </span>
          </p>
        </div>

        <NavBarMenu
          displayName={session.displayName}
          isAdmin={session.isAdmin}
          phase1Locked={phase1Locked}
          phase2Locked={phase2Locked}
          phase2Open={phase.knockoutWindowOpen}
          canEditGroups={canEditGroups}
          canEditKnockout={canEditKnockout}
        />
      </div>
    </header>
  );
}
