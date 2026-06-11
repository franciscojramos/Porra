import Link from "next/link";
import { getSession } from "@/lib/auth";
import { logoutAction } from "@/lib/actions";
import { prisma } from "@/lib/db";
import { getTournamentPhaseState } from "@/lib/tournamentPhase";

const mainLinks = [
  { href: "/inicio", label: "Inicio" },
  { href: "/clasificacion", label: "Clasificación" },
  { href: "/perfil", label: "Mi perfil" },
  { href: "/jugadores", label: "Jugadores" },
];

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
    <header className="border-b border-white/10 bg-emerald-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <div>
          <Link href="/inicio" className="text-lg font-bold text-white">
            Porra Mundial 2026
          </Link>
          <p className="text-sm text-emerald-200">
            Hola, {session.displayName}
            <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">
              F1 {phase1Locked ? "✓" : "…"}
            </span>
            <span className="ml-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">
              F2 {phase2Locked ? "✓" : phase.knockoutWindowOpen ? "…" : "—"}
            </span>
          </p>
        </div>
        <nav className="flex flex-wrap items-center gap-2">
          {mainLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-1.5 text-sm text-emerald-100 transition hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/grupos"
            className="rounded-full px-3 py-1.5 text-sm text-emerald-100 transition hover:bg-white/10 hover:text-white"
            title={canEditGroups ? "Editar grupos" : "Solo lectura"}
          >
            {canEditGroups ? "Grupos" : "Ver grupos"}
          </Link>
          <Link
            href="/eliminatorias"
            className="rounded-full px-3 py-1.5 text-sm text-emerald-100 transition hover:bg-white/10 hover:text-white"
            title={canEditKnockout ? "Editar eliminatorias" : "Solo lectura"}
          >
            {canEditKnockout ? "Eliminatorias" : "Ver eliminatorias"}
          </Link>
          <Link
            href="/premios"
            className="rounded-full px-3 py-1.5 text-sm text-emerald-100 transition hover:bg-white/10 hover:text-white"
            title={canEditGroups ? "Editar premios" : "Solo lectura"}
          >
            {canEditGroups ? "Premios" : "Ver premios"}
          </Link>
          <Link
            href="/reglas"
            className="rounded-full px-3 py-1.5 text-sm text-emerald-100 transition hover:bg-white/10 hover:text-white"
          >
            Puntos
          </Link>
          {session.isAdmin && (
            <Link
              href="/admin"
              className="rounded-full bg-amber-500 px-3 py-1.5 text-sm font-medium text-emerald-950"
            >
              Admin
            </Link>
          )}
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-full border border-white/20 px-3 py-1.5 text-sm text-emerald-100 hover:bg-white/10"
            >
              Salir
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
