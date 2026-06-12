import { prisma } from "./db";
import {
  computeBracketState,
  resolveKnockoutWinner,
  resolveSlotLabel,
  matchWinnerSide,
  type StandingByGroup,
} from "./knockoutBracketResolve";

export type DerivedFinalBracket = {
  championTeamId: string | null;
  runnerUpTeamId: string | null;
  thirdPlaceTeamId: string | null;
  fourthPlaceTeamId: string | null;
  complete: boolean;
};

export async function deriveFinalBracketFromKnockout(
  userId: string
): Promise<DerivedFinalBracket> {
  const [standingsRows, bestThirds, matches, predictions] = await Promise.all([
    prisma.groupStandingPrediction.findMany({ where: { userId } }),
    prisma.bestThirdPrediction.findMany({ where: { userId } }),
    prisma.match.findMany({
      where: { stage: { not: "GROUP" } },
      orderBy: { matchNumber: "asc" },
    }),
    prisma.matchPrediction.findMany({
      where: { userId, match: { stage: { not: "GROUP" } } },
    }),
  ]);

  const standings: StandingByGroup = Object.fromEntries(
    standingsRows.map((s) => [
      s.groupId,
      {
        firstTeamId: s.firstTeamId,
        secondTeamId: s.secondTeamId,
        thirdTeamId: s.thirdTeamId,
        fourthTeamId: s.fourthTeamId,
      },
    ])
  );

  const predByMatchId = Object.fromEntries(
    predictions.map((p) => [
      p.matchId,
      {
        homeScore: p.homeScore,
        awayScore: p.awayScore,
        advancesTeamId: p.advancesTeamId,
      },
    ])
  );

  const state = computeBracketState(
    matches,
    predByMatchId,
    standings,
    bestThirds.map((t) => t.teamId)
  );

  return {
    championTeamId: state.championTeamId,
    runnerUpTeamId: state.runnerUpTeamId,
    thirdPlaceTeamId: state.thirdPlaceTeamId,
    fourthPlaceTeamId: state.fourthPlaceTeamId,
    complete: state.complete,
  };
}

export async function syncFinalBracketFromKnockout(userId: string) {
  const derived = await deriveFinalBracketFromKnockout(userId);

  await prisma.finalBracketPrediction.upsert({
    where: { userId },
    create: {
      userId,
      championTeamId: derived.championTeamId,
      runnerUpTeamId: derived.runnerUpTeamId,
      thirdPlaceTeamId: derived.thirdPlaceTeamId,
      fourthPlaceTeamId: derived.fourthPlaceTeamId,
      points: 0,
    },
    update: {
      championTeamId: derived.championTeamId,
      runnerUpTeamId: derived.runnerUpTeamId,
      thirdPlaceTeamId: derived.thirdPlaceTeamId,
      fourthPlaceTeamId: derived.fourthPlaceTeamId,
      points: 0,
    },
  });

  return derived;
}

export { resolveSlotLabel, matchWinnerSide, resolveKnockoutWinner, computeBracketState };
export type { StandingByGroup } from "./knockoutBracketResolve";
