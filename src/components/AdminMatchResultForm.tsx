"use client";

import { useMemo, useState } from "react";
import { SubmitButton } from "@/components/ui";
import type { PlayerOption } from "@/lib/players";

type Props = {
  matchId: string;
  homeName: string;
  awayName: string;
  homePlayers: PlayerOption[];
  awayPlayers: PlayerOption[];
  defaultHomeScore?: number | null;
  defaultAwayScore?: number | null;
  defaultScorersHome?: string | null;
  defaultScorersAway?: string | null;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel?: string;
};

function clampScore(value: number) {
  return Math.min(20, Math.max(0, value));
}

function ScorerFields({
  side,
  count,
  players,
  defaults,
  fallbackDefault,
}: {
  side: "Home" | "Away";
  count: number;
  players: PlayerOption[];
  defaults: string[];
  fallbackDefault?: string | null;
}) {
  if (players.length === 0) {
    return (
      <label className="flex flex-col gap-1 text-xs text-emerald-100">
        <span>Goleadores ({side === "Home" ? "local" : "visitante"})</span>
        <input
          name={`scorers${side}`}
          defaultValue={fallbackDefault ?? ""}
          placeholder="Nombre, nombre… (texto libre en eliminatorias)"
          className="w-full rounded border border-white/10 bg-emerald-950 px-2 py-1"
        />
      </label>
    );
  }

  return (
    <div className="space-y-1">
      <p className="text-xs text-emerald-300">
        Goleadores ({side === "Home" ? "local" : "visitante"})
        {count === 0 ? " — sin goles" : ""}
      </p>
      {Array.from({ length: count }, (_, i) => (
        <select
          key={`${side}-${i}`}
          name={`scorer${side}`}
          defaultValue={defaults[i] ?? ""}
          className="w-full rounded border border-white/10 bg-emerald-950 px-2 py-1 text-sm text-white"
        >
          <option value="">Elegir goleador…</option>
          {players.map((player) => (
            <option key={player.value} value={player.value}>
              {player.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}

export function AdminMatchResultForm({
  matchId,
  homeName,
  awayName,
  homePlayers,
  awayPlayers,
  defaultHomeScore,
  defaultAwayScore,
  defaultScorersHome,
  defaultScorersAway,
  action,
  submitLabel = "Guardar resultado",
}: Props) {
  const [homeScore, setHomeScore] = useState(clampScore(defaultHomeScore ?? 0));
  const [awayScore, setAwayScore] = useState(clampScore(defaultAwayScore ?? 0));

  const homeDefaults = useMemo(
    () =>
      (defaultScorersHome ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [defaultScorersHome]
  );
  const awayDefaults = useMemo(
    () =>
      (defaultScorersAway ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [defaultScorersAway]
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="matchId" value={matchId} />

      <div className="flex flex-wrap items-end gap-3">
        <span className="min-w-[120px] font-semibold text-white">{homeName}</span>
        <label className="flex flex-col gap-1 text-sm text-emerald-100">
          <span>Goles</span>
          <input
            type="number"
            name="homeScore"
            min={0}
            max={20}
            value={homeScore}
            onChange={(e) => setHomeScore(clampScore(Number(e.target.value) || 0))}
            className="w-16 rounded-lg border border-white/10 bg-emerald-950 px-2 py-1 text-center text-white"
          />
        </label>
        <span className="pb-1 text-lg text-emerald-300">-</span>
        <label className="flex flex-col gap-1 text-sm text-emerald-100">
          <span>Goles</span>
          <input
            type="number"
            name="awayScore"
            min={0}
            max={20}
            value={awayScore}
            onChange={(e) => setAwayScore(clampScore(Number(e.target.value) || 0))}
            className="w-16 rounded-lg border border-white/10 bg-emerald-950 px-2 py-1 text-center text-white"
          />
        </label>
        <span className="min-w-[120px] font-semibold text-white">{awayName}</span>
      </div>

      <p className="text-xs text-emerald-400">
        Al cambiar el marcador se muestran los selectores de goleador correspondientes.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <ScorerFields
          side="Home"
          count={homeScore}
          players={homePlayers}
          defaults={homeDefaults}
          fallbackDefault={defaultScorersHome}
        />
        <ScorerFields
          side="Away"
          count={awayScore}
          players={awayPlayers}
          defaults={awayDefaults}
          fallbackDefault={defaultScorersAway}
        />
      </div>

      <SubmitButton label={submitLabel} />
    </form>
  );
}
