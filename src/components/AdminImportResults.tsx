"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { importPendingResultsAction } from "@/lib/actions";

export function AdminImportResults() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleImport() {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await importPendingResultsAction();
      if (result.error) {
        setError(result.error);
        return;
      }

      const parts = [
        `${result.imported} importado${result.imported === 1 ? "" : "s"}`,
        result.pending > 0 ? `${result.pending} pendiente${result.pending === 1 ? "" : "s"} en API` : null,
        result.skipped > 0 ? `${result.skipped} omitido${result.skipped === 1 ? "" : "s"}` : null,
        result.errors > 0 ? `${result.errors} error${result.errors === 1 ? "" : "es"}` : null,
      ].filter(Boolean);

      setMessage(parts.join(" · ") || "Nada que importar ahora mismo.");
      if (result.errorSamples?.length) {
        setError(result.errorSamples.join(" · "));
      }
      router.refresh();
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleImport}
        disabled={pending}
        className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? "Importando resultados…" : "Importar resultados (API)"}
      </button>
      {message && <p className="mt-2 text-sm text-emerald-300">{message}</p>}
      {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
      <p className="mt-2 text-xs text-emerald-400">
        Solo marcadores desde football-data.org. No pisa resultados ya guardados ni los editados a mano.
      </p>
    </div>
  );
}
