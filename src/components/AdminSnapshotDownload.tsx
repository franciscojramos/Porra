"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import type { SnapshotExportData } from "@/lib/snapshot";

type Props = {
  data: SnapshotExportData;
};

export function AdminSnapshotDownload({ data }: Props) {
  const snapshotRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    if (!snapshotRef.current) return;

    setDownloading(true);
    setError(null);

    try {
      const dataUrl = await toPng(snapshotRef.current, {
        pixelRatio: 2,
        backgroundColor: "#022c22",
        cacheBust: true,
      });

      const stamp = new Date()
        .toISOString()
        .slice(0, 16)
        .replace("T", "-")
        .replace(":", "h");
      const link = document.createElement("a");
      link.download = `porra-resumen-${stamp}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      setError("No se pudo generar la imagen. Inténtalo de nuevo.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-amber-400 disabled:cursor-wait disabled:opacity-70"
      >
        {downloading ? "Generando imagen…" : "Descargar resumen (clasificación + próximos partidos)"}
      </button>
      {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
      <p className="mt-2 text-xs text-emerald-400">
        Solo visible para admin. La imagen incluye la clasificación actual, la hora y los 4
        próximos partidos con los pronósticos de cada jugador.
      </p>

      <div aria-hidden className="pointer-events-none fixed -left-[10000px] top-0">
        <div ref={snapshotRef} className="w-[820px] bg-emerald-950 p-8 text-white">
          <div className="mb-6 border-b border-emerald-700 pb-4">
            <h1 className="text-3xl font-bold text-white">Porrita.io Amigos</h1>
            <p className="mt-2 text-sm text-emerald-300">
              Resumen actualizado · {data.generatedAt} (Madrid)
            </p>
          </div>

          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-amber-300">Clasificación porra</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-emerald-800 text-left text-emerald-300">
                  <th className="pb-2 pr-3">#</th>
                  <th className="pb-2 pr-3">Jugador</th>
                  <th className="pb-2 text-right">Pts</th>
                </tr>
              </thead>
              <tbody>
                {data.leaderboard.map((row) => (
                  <tr key={row.position} className="border-b border-emerald-900/60">
                    <td className="py-2 pr-3 text-emerald-400">{row.position}</td>
                    <td className="py-2 pr-3 font-medium">{row.displayName}</td>
                    <td className="py-2 text-right font-bold text-emerald-300">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-amber-300">
              Próximos 4 partidos · pronósticos
            </h2>

            {data.upcomingMatches.length === 0 ? (
              <p className="text-sm text-emerald-300">No hay partidos pendientes por disputarse.</p>
            ) : (
              <div className="space-y-6">
                {data.upcomingMatches.map((match) => (
                  <div
                    key={match.matchNumber}
                    className="rounded-xl border border-emerald-800 bg-emerald-900/40 p-4"
                  >
                    <div className="mb-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-emerald-400">
                        Partido #{match.matchNumber}
                      </p>
                      <p className="mt-1 text-lg font-semibold">
                        {match.homeName}{" "}
                        <span className="text-emerald-300">vs</span> {match.awayName}
                      </p>
                      <p className="mt-1 text-sm text-emerald-300">{match.kickoffLabel}</p>
                    </div>

                    {match.predictions.length === 0 ? (
                      <p className="text-sm text-emerald-400">Nadie ha pronosticado este partido.</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-emerald-800 text-left text-emerald-300">
                            <th className="pb-2 pr-3">Jugador</th>
                            <th className="pb-2 text-right">Pronóstico</th>
                          </tr>
                        </thead>
                        <tbody>
                          {match.predictions.map((pred) => (
                            <tr
                              key={`${match.matchNumber}-${pred.displayName}`}
                              className="border-b border-emerald-900/40"
                            >
                              <td className="py-1.5 pr-3">{pred.displayName}</td>
                              <td className="py-1.5 text-right font-semibold tabular-nums text-emerald-200">
                                {pred.homeScore} - {pred.awayScore}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
