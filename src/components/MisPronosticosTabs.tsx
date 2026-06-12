"use client";

import { ReactNode, useEffect, useState } from "react";

export type MisPronosticosTab = "grupos" | "eliminatorias" | "premios";

const TABS: { id: MisPronosticosTab; label: string }[] = [
  { id: "grupos", label: "Grupos" },
  { id: "eliminatorias", label: "Eliminatorias" },
  { id: "premios", label: "Premios" },
];

export function MisPronosticosTabs({
  initialTab,
  panels,
}: {
  initialTab: MisPronosticosTab;
  panels: Record<MisPronosticosTab, ReactNode>;
}) {
  const [active, setActive] = useState<MisPronosticosTab>(initialTab);

  useEffect(() => {
    setActive(initialTab);
  }, [initialTab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={
              active === tab.id
                ? "rounded-t-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950"
                : "rounded-t-lg px-4 py-2 text-sm text-emerald-200 transition hover:bg-white/10 hover:text-white"
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>{panels[active]}</div>
    </div>
  );
}
