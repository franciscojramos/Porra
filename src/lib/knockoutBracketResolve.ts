import { formatTeamDisplay } from "./teamFlags";

export type StandingByGroup = Record<
  string,
  { firstTeamId: string; secondTeamId: string; thirdTeamId: string; fourthTeamId: string }
>;

export type KnockoutMatchInput = {
  id: string;
  matchNumber: number;
  stage: string;
  homeLabel?: string | null;
  awayLabel?: string | null;
  homeTeamId?: string | null;
  awayTeamId?: string | null;
};

/** Resuelve el ganador en eliminatorias (90'/120'). Con empate usa el desempate. */
export function resolveKnockoutWinner(
  homeScore: number,
  awayScore: number,
  homeTeamId: string | null | undefined,
  awayTeamId: string | null | undefined,
  tiebreakerTeamId: string | null | undefined
): string | null {
  const side = matchWinnerSide(homeScore, awayScore);
  if (side === "HOME") return homeTeamId ?? null;
  if (side === "AWAY") return awayTeamId ?? null;
  if (
    tiebreakerTeamId &&
    (tiebreakerTeamId === homeTeamId || tiebreakerTeamId === awayTeamId)
  ) {
    return tiebreakerTeamId;
  }
  return null;
}

export type PredictionInput = {
  homeScore: number;
  awayScore: number;
  advancesTeamId?: string | null;
};

export type TeamInfo = {
  id: string;
  name: string;
  code: string;
};

export type ResolvedMatchSlot = {
  matchId: string;
  matchNumber: number;
  stage: string;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeLabel: string | null;
  awayLabel: string | null;
  winnerTeamId: string | null;
  loserTeamId: string | null;
  isTie: boolean;
  isReady: boolean;
  hasPrediction: boolean;
};

export type BracketState = {
  slots: Record<string, ResolvedMatchSlot>;
  winners: Record<number, string>;
  losers: Record<number, string>;
  championTeamId: string | null;
  runnerUpTeamId: string | null;
  thirdPlaceTeamId: string | null;
  fourthPlaceTeamId: string | null;
  complete: boolean;
};

export function matchWinnerSide(homeScore: number, awayScore: number) {
  if (homeScore > awayScore) return "HOME" as const;
  if (awayScore > homeScore) return "AWAY" as const;
  return null;
}

export function resolveSlotLabel(
  label: string | null | undefined,
  standings: StandingByGroup,
  bestThirdIds: Set<string>,
  winners: Map<number, string>,
  losers: Map<number, string>
): string | null {
  if (!label) return null;

  if (label.startsWith("W")) {
    return winners.get(Number(label.slice(1))) ?? null;
  }
  if (label.startsWith("L")) {
    return losers.get(Number(label.slice(1))) ?? null;
  }

  const posMatch = label.match(/^([12])([A-L])$/);
  if (posMatch) {
    const [, pos, groupId] = posMatch;
    const row = standings[groupId];
    if (!row) return null;
    return pos === "1" ? row.firstTeamId : row.secondTeamId;
  }

  if (label.startsWith("3")) {
    const groupLetters = label
      .slice(1)
      .replace(/\//g, "")
      .split("")
      .filter((c) => c >= "A" && c <= "L");

    for (const groupId of groupLetters) {
      const row = standings[groupId];
      if (row && bestThirdIds.has(row.thirdTeamId)) {
        return row.thirdTeamId;
      }
    }
    return null;
  }

  return null;
}

export function computeBracketState(
  matches: KnockoutMatchInput[],
  predictions: Record<string, PredictionInput | undefined>,
  standings: StandingByGroup,
  bestThirdIds: string[]
): BracketState {
  const bestThirdSet = new Set(bestThirdIds);
  const winners = new Map<number, string>();
  const losers = new Map<number, string>();
  const slots: Record<string, ResolvedMatchSlot> = {};

  const sorted = [...matches].sort((a, b) => a.matchNumber - b.matchNumber);

  for (const match of sorted) {
    const homeTeamId = resolveSlotLabel(
      match.homeLabel,
      standings,
      bestThirdSet,
      winners,
      losers
    );
    const awayTeamId = resolveSlotLabel(
      match.awayLabel,
      standings,
      bestThirdSet,
      winners,
      losers
    );

    const pred = predictions[match.id];
    const hasPrediction = pred !== undefined;
    let winnerTeamId: string | null = null;
    let loserTeamId: string | null = null;
    let isTie = false;

    if (pred && homeTeamId && awayTeamId) {
      winnerTeamId = resolveKnockoutWinner(
        pred.homeScore,
        pred.awayScore,
        homeTeamId,
        awayTeamId,
        pred.advancesTeamId
      );
      if (winnerTeamId === homeTeamId) {
        loserTeamId = awayTeamId;
      } else if (winnerTeamId === awayTeamId) {
        loserTeamId = homeTeamId;
      } else if (pred.homeScore === pred.awayScore) {
        isTie = true;
      }

      if (winnerTeamId && loserTeamId) {
        winners.set(match.matchNumber, winnerTeamId);
        losers.set(match.matchNumber, loserTeamId);
      }
    }

    slots[match.id] = {
      matchId: match.id,
      matchNumber: match.matchNumber,
      stage: match.stage,
      homeTeamId,
      awayTeamId,
      homeLabel: match.homeLabel ?? null,
      awayLabel: match.awayLabel ?? null,
      winnerTeamId,
      loserTeamId,
      isTie,
      isReady: !!(homeTeamId && awayTeamId),
      hasPrediction,
    };
  }

  const championTeamId = winners.get(104) ?? null;
  const runnerUpTeamId = losers.get(104) ?? null;
  const thirdPlaceTeamId = winners.get(103) ?? null;
  const fourthPlaceTeamId = losers.get(103) ?? null;

  return {
    slots,
    winners: Object.fromEntries(winners),
    losers: Object.fromEntries(losers),
    championTeamId,
    runnerUpTeamId,
    thirdPlaceTeamId,
    fourthPlaceTeamId,
    complete: !!(championTeamId && runnerUpTeamId && thirdPlaceTeamId && fourthPlaceTeamId),
  };
}

export function teamDisplayName(
  teamId: string | null,
  label: string | null,
  teamMap: Record<string, TeamInfo | undefined>,
  officialTeamId?: string | null
): string {
  if (teamId && teamMap[teamId]) {
    const t = teamMap[teamId]!;
    return formatTeamDisplay(t.name, t.code);
  }
  if (officialTeamId && teamMap[officialTeamId]) {
    const t = teamMap[officialTeamId]!;
    return formatTeamDisplay(t.name, t.code);
  }
  return label ?? "Por definir";
}

export function teamCode(
  teamId: string | null,
  teamMap: Record<string, TeamInfo | undefined>,
  officialTeamId?: string | null
): string {
  if (teamId && teamMap[teamId]) return teamMap[teamId]!.code;
  if (officialTeamId && teamMap[officialTeamId]) return teamMap[officialTeamId]!.code;
  return "—";
}
