"use client";

import Link from "next/link";
import { useState } from "react";
import { logoutAction } from "@/lib/actions";

type NavLink = { href: string; label: string; highlight?: boolean };

type Props = {
  displayName: string;
  isAdmin: boolean;
  phase1Locked: boolean;
  phase2Locked: boolean;
  phase2Open: boolean;
  canEditGroups: boolean;
  canEditKnockout: boolean;
};

export function NavBarMenu({
  displayName,
  isAdmin,
  phase1Locked,
  phase2Locked,
  phase2Open,
  canEditGroups,
  canEditKnockout,
}: Props) {
  const [open, setOpen] = useState(false);

  const links: NavLink[] = [
    { href: "/inicio", label: "Inicio" },
    { href: "/clasificacion", label: "Clasificación" },
    { href: "/perfil", label: "Mi perfil" },
    { href: "/jugadores", label: "Jugadores" },
    { href: "/grupos", label: canEditGroups ? "Grupos" : "Ver grupos" },
    {
      href: "/eliminatorias",
      label: canEditKnockout ? "Eliminatorias" : "Ver eliminatorias",
    },
    { href: "/premios", label: canEditGroups ? "Premios" : "Ver premios" },
    { href: "/reglas", label: "Puntos" },
  ];

  if (isAdmin) {
    links.push({ href: "/admin", label: "Admin", highlight: true });
  }

  const close = () => setOpen(false);

  return (
    <>
      {/* Desktop */}
      <nav className="hidden items-center gap-2 md:flex md:flex-wrap">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={
              link.highlight
                ? "rounded-full bg-amber-500 px-3 py-1.5 text-sm font-medium text-emerald-950"
                : "rounded-full px-3 py-1.5 text-sm text-emerald-100 transition hover:bg-white/10 hover:text-white"
            }
          >
            {link.label}
          </Link>
        ))}
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-full border border-white/20 px-3 py-1.5 text-sm text-emerald-100 hover:bg-white/10"
          >
            Salir
          </button>
        </form>
      </nav>

      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-emerald-900/80 md:hidden"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
      >
        <span
          className={`block h-0.5 w-5 rounded-full bg-emerald-100 transition-transform duration-200 ${
            open ? "translate-y-2 rotate-45" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-5 rounded-full bg-emerald-100 transition-opacity duration-200 ${
            open ? "opacity-0" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-5 rounded-full bg-emerald-100 transition-transform duration-200 ${
            open ? "-translate-y-2 -rotate-45" : ""
          }`}
        />
      </button>

      {/* Mobile panel */}
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={close}
            aria-label="Cerrar menú"
          />
          <nav className="fixed right-0 top-0 z-40 flex h-full w-[min(100vw-3rem,280px)] flex-col gap-1 overflow-y-auto border-l border-white/10 bg-emerald-950 px-4 pb-8 pt-20 shadow-2xl md:hidden">
            <p className="mb-3 border-b border-white/10 pb-3 text-sm text-emerald-200">
              Hola, <strong className="text-white">{displayName}</strong>
              <span className="mt-1 block text-xs">
                F1 {phase1Locked ? "✓" : "…"} · F2{" "}
                {phase2Locked ? "✓" : phase2Open ? "…" : "—"}
              </span>
            </p>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className={
                  link.highlight
                    ? "rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-emerald-950"
                    : "rounded-xl px-4 py-3 text-sm text-emerald-100 hover:bg-white/10"
                }
              >
                {link.label}
              </Link>
            ))}
            <form action={logoutAction} className="mt-4 border-t border-white/10 pt-4">
              <button
                type="submit"
                className="w-full rounded-xl border border-white/20 px-4 py-3 text-sm text-emerald-100 hover:bg-white/10"
              >
                Salir
              </button>
            </form>
          </nav>
        </>
      )}
    </>
  );
}
