import { MatchStage } from "@prisma/client";
import type { FootballDataScore, FootballDataScorePart, MappedMatchResult } from "./types";

function part(value: FootballDataScorePart | null | undefined) {
  return {
    home: value?.home ?? 0,
    away: value?.away ?? 0,
  };
}

/** Marcador 90'/120' antes de penaltis, alineado con las reglas de la porra. */
export function mapFootballDataScore(
  score: FootballDataScore,
  stage: MatchStage
): MappedMatchResult {
  if (stage === MatchStage.GROUP) {
    const ft = score.fullTime ?? score.regularTime;
    return {
      homeScore: ft?.home ?? 0,
      awayScore: ft?.away ?? 0,
      winnerSide: null,
    };
  }

  const regular = part(score.regularTime ?? score.fullTime);
  const extra = part(score.extraTime);
  const homeScore = regular.home + extra.home;
  const awayScore = regular.away + extra.away;

  if (homeScore > awayScore) {
    return { homeScore, awayScore, winnerSide: "HOME" };
  }
  if (awayScore > homeScore) {
    return { homeScore, awayScore, winnerSide: "AWAY" };
  }

  if (score.winner === "HOME_TEAM") {
    return { homeScore, awayScore, winnerSide: "HOME" };
  }
  if (score.winner === "AWAY_TEAM") {
    return { homeScore, awayScore, winnerSide: "AWAY" };
  }

  return { homeScore, awayScore, winnerSide: null };
}
