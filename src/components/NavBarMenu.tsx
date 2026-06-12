"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { logoutAction } from "@/lib/actions";

type NavLink = { href: string; label: string; highlight?: boolean };

type Props = {
  displayName: string;
  isAdmin: boolean;
};

export function NavBarMenu({ displayName, isAdmin }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const links: NavLink[] = [
    { href: "/inicio", label: "Inicio" },
    { href: "/clasificacion", label: "Clasificación" },
    { href: "/estadisticas", label: "Estadísticas" },
    ...(isAdmin
      ? []
      : [
          { href: "/mis-pronosticos", label: "Mis pronósticos" },
          { href: "/perfil", label: "Mi perfil" },
        ]),
    { href: "/reglas", label: "Puntos" },
  ];

  if (isAdmin) {
    links.push({ href: "/admin", label: "Admin", highlight: true });
  }

  const close = () => setOpen(false);

  const mobileMenu =
    open && mounted
      ? createPortal(
          <>
            <button
              type="button"
              className="fixed inset-0 z-[100] bg-black/60 md:hidden"
              onClick={close}
              aria-label="Cerrar menú"
            />
            <nav
              className="fixed inset-y-0 right-0 z-[101] flex w-full max-w-xs flex-col overflow-y-auto border-l border-white/10 bg-emerald-950 px-4 pb-8 pt-4 shadow-2xl md:hidden"
              aria-label="Menú principal"
            >
              <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-emerald-400">Menú</p>
                  <p className="truncate text-sm text-emerald-100">
                    Hola, <strong className="text-white">{displayName}</strong>
                  </p>
                  {isAdmin && (
                    <span className="mt-1 inline-block rounded-full bg-amber-500/25 px-2 py-0.5 text-xs text-amber-200">
                      Admin
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-emerald-900/80 text-emerald-100"
                  aria-label="Cerrar menú"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-1">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={close}
                    className={
                      link.highlight
                        ? "rounded-xl bg-amber-500 px-4 py-3.5 text-base font-semibold text-emerald-950"
                        : "rounded-xl px-4 py-3.5 text-base text-emerald-100 active:bg-white/10"
                    }
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <form action={logoutAction} className="mt-auto border-t border-white/10 pt-4">
                <button
                  type="submit"
                  className="w-full rounded-xl border border-white/20 px-4 py-3.5 text-base text-emerald-100 active:bg-white/10"
                >
                  Salir
                </button>
              </form>
            </nav>
          </>,
          document.body
        )
      : null;

  return (
    <>
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

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative z-10 flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-emerald-900/80 md:hidden"
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

      {mobileMenu}
    </>
  );
}
