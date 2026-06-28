"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { MatchStage } from "@prisma/client";
import { saveAllKnockoutPredictionsAction } from "@/lib/actions";
import {
  computeProgressiveBracketState,
  teamDisplayName,
  type KnockoutMatchInput,
  type PredictionInput,
  type StandingByGroup,
  type TeamInfo,
} from "@/lib/knockoutBracketResolve";
import type { KnockoutStageEditState } from "@/lib/knockoutRoundUnlock";

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
  officialStandings: StandingByGroup;
  officialBestThirdIds: string[];
  editable: boolean;
  editableStages: string[];
  stageEditStates: KnockoutStageEditState[];
  officialWinners: Record<number, string>;
  officialLosers: Record<number, string>;
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

function predictionsEqual(a: PredictionInput, b: PredictionInput) {
  return (
    a.homeScore === b.homeScore &&
    a.awayScore === b.awayScore &&
    (a.advancesTeamId ?? null) === (b.advancesTeamId ?? null)
  );
}

function BracketTeamRow({
  name,
  score,
  isWinner,
  isLoser,
  editable,
  onScoreChange,
  placeholder,
}: {
  name: string;
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
  lockedReason,
  destination,
  onScoresChange,
  onAdvancesChange,
}: {
  match: SerializedMatch;
  slot: ReturnType<typeof computeProgressiveBracketState>["slots"][string];
  teamMap: Record<string, TeamInfo>;
  prediction: PredictionInput;
  editable: boolean;
  lockedReason?: string | null;
  destination: { matchNumber: number; side: "home" | "away" } | undefined;
  onScoresChange: (home: number, away: number) => void;
  onAdvancesChange: (teamId: string) => void;
}) {
  const homeName = teamDisplayName(slot.homeTeamId, slot.homeLabel, teamMap);
  const awayName = teamDisplayName(slot.awayTeamId, slot.awayLabel, teamMap);
  const winnerId = slot.winnerTeamId;
  const homeWinner = winnerId === slot.homeTeamId;
  const awayWinner = winnerId === slot.awayTeamId;
  const isDrawScore =
    slot.isReady && prediction.homeScore === prediction.awayScore;

  return (
    <div
      className={`relative w-[220px] rounded-xl border p-2 transition-all duration-300 ${
        slot.isTie
          ? "border-amber-400/50 bg-amber-500/10"
          : winnerId
            ? "border-emerald-400/40 bg-emerald-500/10 shadow-lg shadow-emerald-900/30"
            : "border-white/10 bg-emerald-950/60"
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
          #{match.matchNumber}
        </span>
        {slot.isTie && (
          <span className="text-[10px] text-amber-300">Elige ganador</span>
        )}
        {!slot.isReady && (
          <span className="text-[10px] text-emerald-500">
            {lockedReason ?? "Esperando…"}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <BracketTeamRow
          name={homeName}
          score={prediction.homeScore}
          isWinner={homeWinner}
          isLoser={!!winnerId && !homeWinner && slot.isReady}
          editable={editable && slot.isReady}
          placeholder={!slot.homeTeamId}
          onScoreChange={(v) => onScoresChange(v, prediction.awayScore)}
        />
        <BracketTeamRow
          name={awayName}
          score={prediction.awayScore}
          isWinner={awayWinner}
          isLoser={!!winnerId && !awayWinner && slot.isReady}
          editable={editable && slot.isReady}
          placeholder={!slot.awayTeamId}
          onScoreChange={(v) => onScoresChange(prediction.homeScore, v)}
        />
      </div>

      {isDrawScore && editable && slot.homeTeamId && slot.awayTeamId && (
        <div className="mt-2 space-y-1 rounded-lg border border-amber-400/30 bg-amber-500/10 p-2">
          <p className="text-[10px] text-amber-100">
            Empate a {prediction.homeScore}-{prediction.awayScore} · ¿quién pasa?
          </p>
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => onAdvancesChange(slot.homeTeamId!)}
              className={`rounded px-2 py-1 text-left text-[11px] transition ${
                prediction.advancesTeamId === slot.homeTeamId
                  ? "bg-emerald-500 font-semibold text-emerald-950"
                  : "bg-emerald-950/60 text-emerald-100 hover:bg-white/10"
              }`}
            >
              {homeName}
            </button>
            <button
              type="button"
              onClick={() => onAdvancesChange(slot.awayTeamId!)}
              className={`rounded px-2 py-1 text-left text-[11px] transition ${
                prediction.advancesTeamId === slot.awayTeamId
                  ? "bg-emerald-500 font-semibold text-emerald-950"
                  : "bg-emerald-950/60 text-emerald-100 hover:bg-white/10"
              }`}
            >
              {awayName}
            </button>
          </div>
        </div>
      )}

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
  officialStandings,
  officialBestThirdIds,
  editable,
  editableStages,
  stageEditStates,
  officialWinners,
  officialLosers,
  stageLabels,
}: Props) {
  const editableStageSet = useMemo(() => new Set(editableStages), [editableStages]);
  const lockedReasonByStage = useMemo(
    () => Object.fromEntries(stageEditStates.map((s) => [s.stage, s.lockedReason])),
    [stageEditStates]
  );
  const officialWinnersMap = useMemo(
    () => new Map(Object.entries(officialWinners).map(([k, v]) => [Number(k), v])),
    [officialWinners]
  );
  const officialLosersMap = useMemo(
    () => new Map(Object.entries(officialLosers).map(([k, v]) => [Number(k), v])),
    [officialLosers]
  );

  const isMatchEditable = useCallback(
    (stage: string) => editable && editableStageSet.has(stage),
    [editable, editableStageSet]
  );
  const [view, setView] = useState<"bracket" | "list">("bracket");
  const [predictions, setPredictions] = useState<Record<string, PredictionInput>>(() => {
    const base: Record<string, PredictionInput> = {};
    for (const m of matches) {
      const initial = initialPredictions[m.id];
      base[m.id] = initial ?? { homeScore: 0, awayScore: 0, advancesTeamId: null };
    }
    return base;
  });
  const [savedBaseline, setSavedBaseline] = useState(initialPredictions);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, startSaveTransition] = useTransition();

  const winnerDestinations = useMemo(() => buildWinnerDestinations(matches), [matches]);

  const hasUnsavedChanges = useMemo(() => {
    return matches.some((m) => {
      const current = predictions[m.id] ?? { homeScore: 0, awayScore: 0, advancesTeamId: null };
      const saved = savedBaseline[m.id] ?? { homeScore: 0, awayScore: 0, advancesTeamId: null };
      return !predictionsEqual(current, saved);
    });
  }, [matches, predictions, savedBaseline]);

  const bracketState = useMemo(
    () =>
      computeProgressiveBracketState(
        matches,
        predictions,
        userStandings,
        userBestThirdIds,
        officialWinnersMap,
        officialLosersMap,
        officialStandings,
        officialBestThirdIds
      ),
    [
      matches,
      predictions,
      userStandings,
      userBestThirdIds,
      officialWinnersMap,
      officialLosersMap,
      officialStandings,
      officialBestThirdIds,
    ]
  );

  const matchesByStage = useMemo(() => {
    const map: Partial<Record<MatchStage, SerializedMatch[]>> = {};
    for (const round of ROUND_ORDER) {
      map[round.stage] = matches.filter((m) => m.stage === round.stage);
    }
    return map;
  }, [matches]);

  const handleScoresChange = useCallback((matchId: string, homeScore: number, awayScore: number) => {
    setPredictions((prev) => {
      const current = prev[matchId] ?? { homeScore: 0, awayScore: 0, advancesTeamId: null };
      const advancesTeamId =
        homeScore === awayScore ? current.advancesTeamId ?? null : null;
      return { ...prev, [matchId]: { homeScore, awayScore, advancesTeamId } };
    });
    setSaveMessage(null);
    setSaveError(null);
  }, []);

  const handleAdvancesChange = useCallback((matchId: string, teamId: string) => {
    setPredictions((prev) => {
      const current = prev[matchId] ?? { homeScore: 0, awayScore: 0, advancesTeamId: null };
      return { ...prev, [matchId]: { ...current, advancesTeamId: teamId } };
    });
    setSaveMessage(null);
    setSaveError(null);
  }, []);

  const handleSaveAll = useCallback(() => {
    startSaveTransition(async () => {
      setSaveMessage(null);
      setSaveError(null);

      const fd = new FormData();
      fd.set("predictions", JSON.stringify(predictions));

      const result = await saveAllKnockoutPredictionsAction(fd);
      if (result.ok) {
        setSavedBaseline({ ...predictions });
        setSaveMessage("Pronósticos guardados");
      } else {
        setSaveError(result.error ?? "No se pudo guardar.");
      }
    });
  }, [predictions]);

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
        {editable && hasUnsavedChanges && (
          <p className="text-xs text-amber-300">Tienes cambios sin guardar</p>
        )}
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
                    {!editableStageSet.has(round.stage) && (
                      <p className="mt-0.5 text-[10px] text-emerald-500">Bloqueada</p>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-around gap-0">
                    {stageMatches.map((match) => {
                      const slot = bracketState.slots[match.id];
                      const pred = predictions[match.id] ?? {
                        homeScore: 0,
                        awayScore: 0,
                        advancesTeamId: null,
                      };
                      const dest = winnerDestinations.get(match.matchNumber);
                      const matchEditable = isMatchEditable(match.stage);

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
                              editable={matchEditable}
                              lockedReason={lockedReasonByStage[match.stage]}
                              destination={dest}
                              onScoresChange={(h, a) => handleScoresChange(match.id, h, a)}
                              onAdvancesChange={(teamId) =>
                                handleAdvancesChange(match.id, teamId)
                              }
                            />
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
                <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-emerald-300">
                  {stageLabels[round.stage]}
                  {!editableStageSet.has(round.stage) && (
                    <span className="ml-2 text-xs font-normal normal-case text-emerald-500">
                      · bloqueada
                    </span>
                  )}
                </h3>
                {!editableStageSet.has(round.stage) && lockedReasonByStage[round.stage] && (
                  <p className="mb-3 text-xs text-emerald-500">
                    {lockedReasonByStage[round.stage]}
                  </p>
                )}
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {stageMatches.map((match) => {
                    const slot = bracketState.slots[match.id];
                    const pred = predictions[match.id] ?? {
                      homeScore: 0,
                      awayScore: 0,
                      advancesTeamId: null,
                    };
                    const dest = winnerDestinations.get(match.matchNumber);
                    const matchEditable = isMatchEditable(match.stage);

                    return (
                      <BracketMatchCard
                        key={match.id}
                        match={match}
                        slot={slot}
                        teamMap={teamMap}
                        prediction={pred}
                        editable={matchEditable}
                        lockedReason={lockedReasonByStage[match.stage]}
                        destination={dest}
                        onScoresChange={(h, a) => handleScoresChange(match.id, h, a)}
                        onAdvancesChange={(teamId) =>
                          handleAdvancesChange(match.id, teamId)
                        }
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
          Marcador sobre 90&apos; o 120&apos; (antes de penaltis). Si empatas, elige quién pasa.
          Los dieciseisavos muestran los equipos clasificados oficialmente. Octavos y rondas
          siguientes usan los resultados oficiales de la ronda anterior.
        </p>
      )}

      {editable && (
        <div className="border-t border-white/10 pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:opacity-60"
            >
              {isSaving ? "Guardando…" : "Guardar todo"}
            </button>
            {saveMessage && (
              <p className="text-sm text-emerald-300">✓ {saveMessage}</p>
            )}
            {saveError && (
              <p className="text-sm text-amber-300">{saveError}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
