"use client";

import { useMemo, useState } from "react";
import { SubmitButton } from "@/components/ui";
import type { PlayerOption } from "@/lib/players";

type Props = {
  matchId: string;
  homeName: string;
  awayName: string;
  homeTeamId?: string | null;
  awayTeamId?: string | null;
  isKnockout?: boolean;
  homePlayers: PlayerOption[];
  awayPlayers: PlayerOption[];
  defaultHomeScore?: number | null;
  defaultAwayScore?: number | null;
  defaultWinnerTeamId?: string | null;
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
  homeTeamId,
  awayTeamId,
  isKnockout = false,
  homePlayers,
  awayPlayers,
  defaultHomeScore,
  defaultAwayScore,
  defaultWinnerTeamId,
  defaultScorersHome,
  defaultScorersAway,
  action,
  submitLabel = "Guardar resultado",
}: Props) {
  const [homeScore, setHomeScore] = useState(clampScore(defaultHomeScore ?? 0));
  const [awayScore, setAwayScore] = useState(clampScore(Number(defaultAwayScore ?? 0)));
  const [winnerTeamId, setWinnerTeamId] = useState(defaultWinnerTeamId ?? "");

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
        Marcador sobre 90&apos; o 120&apos; (antes de penaltis).
        {isKnockout && homeScore === awayScore && homeTeamId && awayTeamId
          ? " En empate, indica quién gana."
          : " Al cambiar el marcador se muestran los goleadores."}
      </p>

      {isKnockout && homeScore === awayScore && homeTeamId && awayTeamId && (
        <fieldset className="space-y-2 rounded-xl border border-amber-400/30 bg-amber-500/10 p-3">
          <legend className="px-1 text-sm font-medium text-amber-100">
            Ganador (prórroga / penaltis)
          </legend>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-emerald-100">
            <input
              type="radio"
              name="winnerTeamId"
              value={homeTeamId}
              checked={winnerTeamId === homeTeamId}
              onChange={() => setWinnerTeamId(homeTeamId)}
              required
            />
            {homeName}
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-emerald-100">
            <input
              type="radio"
              name="winnerTeamId"
              value={awayTeamId}
              checked={winnerTeamId === awayTeamId}
              onChange={() => setWinnerTeamId(awayTeamId)}
              required
            />
            {awayName}
          </label>
        </fieldset>
      )}

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
