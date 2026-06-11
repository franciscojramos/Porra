"use client";

import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import { MatchStage } from "@prisma/client";
import { saveMatchPredictionAction } from "@/lib/actions";
import {
  computeBracketState,
  teamDisplayName,
  teamCode,
  type KnockoutMatchInput,
  type PredictionInput,
  type StandingByGroup,
  type TeamInfo,
} from "@/lib/knockoutBracketResolve";

type SerializedMatch = KnockoutMatchInput & {
  kickoffAt: string | null;
  stadium: string | null;
};

type Props = {
  matches: SerializedMatch[];
  teamMap: Record<string, TeamInfo>;
  initialPredictions: Record<string, PredictionInput>;
  userStandings: StandingByGroup;
  userBestThirdIds: string[];
  editable: boolean;
  stageLabels: Record<string, string>;
};

const ROUND_ORDER: { stage: MatchStage; short: string }[] = [
  { stage: MatchStage.ROUND_32, short: "R32" },
  { stage: MatchStage.ROUND_16, short: "R16" },
  { stage: MatchStage.QUARTER, short: "CF" },
  { stage: MatchStage.SEMI, short: "SF" },
  { stage: MatchStage.THIRD_PLACE, short: "3º" },
  { stage: MatchStage.FINAL, short: "Final" },
];

const ROUND_ROW_HEIGHT: Partial<Record<MatchStage, number>> = {
  [MatchStage.ROUND_32]: 88,
  [MatchStage.ROUND_16]: 176,
  [MatchStage.QUARTER]: 352,
  [MatchStage.SEMI]: 704,
  [MatchStage.THIRD_PLACE]: 704,
  [MatchStage.FINAL]: 704,
};

function buildWinnerDestinations(matches: KnockoutMatchInput[]) {
  const map = new Map<number, { matchNumber: number; side: "home" | "away" }>();
  for (const m of matches) {
    for (const [side, label] of [
      ["home", m.homeLabel],
      ["away", m.awayLabel],
    ] as const) {
      if (label?.startsWith("W")) {
        const from = Number(label.slice(1));
        if (!Number.isNaN(from)) {
          map.set(from, { matchNumber: m.matchNumber, side });
        }
      }
    }
  }
  return map;
}

function BracketTeamRow({
  name,
  code,
  score,
  isWinner,
  isLoser,
  editable,
  onScoreChange,
  placeholder,
}: {
  name: string;
  code: string;
  score: number;
  isWinner: boolean;
  isLoser: boolean;
  editable: boolean;
  onScoreChange: (v: number) => void;
  placeholder?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-2 py-1.5 transition-all duration-300 ${
        isWinner
          ? "bg-emerald-500/25 ring-1 ring-emerald-400/60"
          : isLoser
            ? "opacity-50"
            : placeholder
              ? "border border-dashed border-white/15 text-emerald-400/70"
              : "bg-emerald-950/50"
      }`}
    >
      <span className="w-7 shrink-0 text-[10px] font-bold uppercase text-emerald-400">
        {code}
      </span>
      <span className={`min-w-0 flex-1 truncate text-sm ${isWinner ? "font-semibold text-white" : "text-emerald-100"}`}>
        {name}
      </span>
      {editable ? (
        <input
          type="number"
          min={0}
          max={20}
          value={score}
          onChange={(e) => onScoreChange(Number(e.target.value) || 0)}
          className="w-10 shrink-0 rounded border border-white/15 bg-emerald-950 px-1 py-0.5 text-center text-sm text-white"
        />
      ) : (
        <span className="w-10 shrink-0 text-center text-sm font-bold text-emerald-300">{score}</span>
      )}
    </div>
  );
}

function BracketMatchCard({
  match,
  slot,
  teamMap,
  prediction,
  editable,
  destination,
  onScoresChange,
  saving,
}: {
  match: SerializedMatch;
  slot: ReturnType<typeof computeBracketState>["slots"][string];
  teamMap: Record<string, TeamInfo>;
  prediction: PredictionInput;
  editable: boolean;
  destination: { matchNumber: number; side: "home" | "away" } | undefined;
  onScoresChange: (home: number, away: number) => void;
  saving: boolean;
}) {
  const homeName = teamDisplayName(
    slot.homeTeamId,
    slot.homeLabel,
    teamMap,
    match.homeTeamId
  );
  const awayName = teamDisplayName(
    slot.awayTeamId,
    slot.awayLabel,
    teamMap,
    match.awayTeamId
  );
  const homeCode = teamCode(slot.homeTeamId, teamMap, match.homeTeamId);
  const awayCode = teamCode(slot.awayTeamId, teamMap, match.awayTeamId);

  const winnerId = slot.winnerTeamId;
  const homeWinner = winnerId === slot.homeTeamId;
  const awayWinner = winnerId === slot.awayTeamId;

  return (
    <div
      className={`relative w-[220px] rounded-xl border p-2 transition-all duration-300 ${
        slot.isTie
          ? "border-amber-400/50 bg-amber-500/10"
          : winnerId
            ? "border-emerald-400/40 bg-emerald-500/10 shadow-lg shadow-emerald-900/30"
            : "border-white/10 bg-emerald-950/60"
      } ${saving ? "opacity-80" : ""}`}
    >
      <div className="mb-2 flex items-center justify-between gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
          #{match.matchNumber}
        </span>
        {slot.isTie && (
          <span className="text-[10px] text-amber-300">Sin empates</span>
        )}
        {!slot.isReady && (
          <span className="text-[10px] text-emerald-500">Esperando…</span>
        )}
      </div>

      <div className="space-y-1">
        <BracketTeamRow
          name={homeName}
          code={homeCode}
          score={prediction.homeScore}
          isWinner={homeWinner}
          isLoser={!!winnerId && !homeWinner && slot.isReady}
          editable={editable && slot.isReady}
          placeholder={!slot.homeTeamId}
          onScoreChange={(v) => onScoresChange(v, prediction.awayScore)}
        />
        <BracketTeamRow
          name={awayName}
          code={awayCode}
          score={prediction.awayScore}
          isWinner={awayWinner}
          isLoser={!!winnerId && !awayWinner && slot.isReady}
          editable={editable && slot.isReady}
          placeholder={!slot.awayTeamId}
          onScoreChange={(v) => onScoresChange(prediction.homeScore, v)}
        />
      </div>

      {winnerId && destination && (
        <p className="mt-2 text-[10px] text-emerald-300 transition-opacity duration-300">
          → #{destination.matchNumber}
        </p>
      )}
    </div>
  );
}

export function KnockoutBracketView({
  matches,
  teamMap,
  initialPredictions,
  userStandings,
  userBestThirdIds,
  editable,
  stageLabels,
}: Props) {
  const [view, setView] = useState<"bracket" | "list">("bracket");
  const [predictions, setPredictions] = useState<Record<string, PredictionInput>>(() => {
    const base: Record<string, PredictionInput> = {};
    for (const m of matches) {
      base[m.id] = initialPredictions[m.id] ?? { homeScore: 0, awayScore: 0 };
    }
    return base;
  });
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [savedFlash, setSavedFlash] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const saveTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const winnerDestinations = useMemo(() => buildWinnerDestinations(matches), [matches]);

  const bracketState = useMemo(
    () => computeBracketState(matches, predictions, userStandings, userBestThirdIds),
    [matches, predictions, userStandings, userBestThirdIds]
  );

  const matchesByStage = useMemo(() => {
    const map: Partial<Record<MatchStage, SerializedMatch[]>> = {};
    for (const round of ROUND_ORDER) {
      map[round.stage] = matches.filter((m) => m.stage === round.stage);
    }
    return map;
  }, [matches]);

  const persistPrediction = useCallback(
    (matchId: string, homeScore: number, awayScore: number) => {
      const existing = saveTimers.current.get(matchId);
      if (existing) clearTimeout(existing);

      saveTimers.current.set(
        matchId,
        setTimeout(() => {
          setSavingIds((prev) => new Set(prev).add(matchId));
          const fd = new FormData();
          fd.set("matchId", matchId);
          fd.set("homeScore", String(homeScore));
          fd.set("awayScore", String(awayScore));

          startTransition(async () => {
            await saveMatchPredictionAction(fd);
            setSavingIds((prev) => {
              const next = new Set(prev);
              next.delete(matchId);
              return next;
            });
            setSavedFlash(matchId);
            setTimeout(() => setSavedFlash((c) => (c === matchId ? null : c)), 1500);
          });
        }, 600)
      );
    },
    []
  );

  const handleScoresChange = useCallback(
    (matchId: string, homeScore: number, awayScore: number) => {
      setPredictions((prev) => ({
        ...prev,
        [matchId]: { homeScore, awayScore },
      }));
      if (editable) {
        persistPrediction(matchId, homeScore, awayScore);
      }
    },
    [editable, persistPrediction]
  );

  const honorNames = {
    champion: teamDisplayName(bracketState.championTeamId, null, teamMap),
    runnerUp: teamDisplayName(bracketState.runnerUpTeamId, null, teamMap),
    third: teamDisplayName(bracketState.thirdPlaceTeamId, null, teamMap),
    fourth: teamDisplayName(bracketState.fourthPlaceTeamId, null, teamMap),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-xl border border-white/10 bg-emerald-950/50 p-1">
          <button
            type="button"
            onClick={() => setView("bracket")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              view === "bracket"
                ? "bg-emerald-500 text-emerald-950"
                : "text-emerald-100 hover:bg-white/5"
            }`}
          >
            Llave visual
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              view === "list"
                ? "bg-emerald-500 text-emerald-950"
                : "text-emerald-100 hover:bg-white/5"
            }`}
          >
            Vista lista
          </button>
        </div>
        {editable && (
          <p className="text-xs text-emerald-400">Los cambios se guardan solos al editar</p>
        )}
      </div>

      <div className="grid gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-[10px] uppercase text-emerald-400">Campeón</p>
          <p className="truncate text-sm font-semibold text-white">{honorNames.champion}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-emerald-400">Subcampeón</p>
          <p className="truncate text-sm font-semibold text-emerald-100">{honorNames.runnerUp}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-emerald-400">3º puesto</p>
          <p className="truncate text-sm font-semibold text-emerald-100">{honorNames.third}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-emerald-400">4º puesto</p>
          <p className="truncate text-sm font-semibold text-emerald-100">{honorNames.fourth}</p>
        </div>
      </div>

      {view === "bracket" ? (
        <div className="relative -mx-4 overflow-x-auto px-4 pb-4 lg:-mx-8 lg:px-8">
          <div className="flex min-w-max gap-3 lg:gap-5">
            {ROUND_ORDER.map((round) => {
              const stageMatches = matchesByStage[round.stage] ?? [];
              if (stageMatches.length === 0) return null;
              const rowHeight = ROUND_ROW_HEIGHT[round.stage] ?? 88;

              return (
                <div key={round.stage} className="flex shrink-0 flex-col">
                  <div className="sticky top-0 z-10 mb-3 rounded-lg bg-emerald-950/95 px-2 py-1.5 text-center backdrop-blur">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                      {stageLabels[round.stage] ?? round.short}
                    </p>
                  </div>
                  <div className="flex flex-1 flex-col justify-around gap-0">
                    {stageMatches.map((match) => {
                      const slot = bracketState.slots[match.id];
                      const pred = predictions[match.id] ?? { homeScore: 0, awayScore: 0 };
                      const dest = winnerDestinations.get(match.matchNumber);

                      return (
                        <div
                          key={match.id}
                          style={{ minHeight: rowHeight }}
                          className="flex items-center py-1"
                        >
                          <div className="relative">
                            {round.stage !== MatchStage.ROUND_32 && (
                              <div
                                className="pointer-events-none absolute -left-3 top-1/2 hidden h-px w-3 bg-emerald-500/30 lg:block"
                                aria-hidden
                              />
                            )}
                            <BracketMatchCard
                              match={match}
                              slot={slot}
                              teamMap={teamMap}
                              prediction={pred}
                              editable={editable}
                              destination={dest}
                              saving={savingIds.has(match.id)}
                              onScoresChange={(h, a) => handleScoresChange(match.id, h, a)}
                            />
                            {savedFlash === match.id && (
                              <span className="absolute -right-1 -top-1 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold text-emerald-950">
                                ✓
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {ROUND_ORDER.map((round) => {
            const stageMatches = matchesByStage[round.stage] ?? [];
            if (stageMatches.length === 0) return null;

            return (
              <section key={round.stage}>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-300">
                  {stageLabels[round.stage]}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {stageMatches.map((match) => {
                    const slot = bracketState.slots[match.id];
                    const pred = predictions[match.id] ?? { homeScore: 0, awayScore: 0 };
                    const dest = winnerDestinations.get(match.matchNumber);

                    return (
                      <BracketMatchCard
                        key={match.id}
                        match={match}
                        slot={slot}
                        teamMap={teamMap}
                        prediction={pred}
                        editable={editable}
                        destination={dest}
                        saving={savingIds.has(match.id)}
                        onScoresChange={(h, a) => handleScoresChange(match.id, h, a)}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {!bracketState.complete && editable && (
        <p className="text-xs text-amber-200">
          Completa toda la llave sin empates. Necesitas Fase 1 guardada (grupos + 8 terceros) para
          resolver los dieciseisavos.
        </p>
      )}
    </div>
  );
}
