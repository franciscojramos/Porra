import { MatchStage } from "@prisma/client";
import { prisma } from "./db";
import { resolveKnockoutWinner } from "./knockoutBracketResolve";
import { PARTICIPANT_USER_WHERE } from "./participants";
import { getTournamentPhaseState } from "./tournamentPhase";

function normalizePlayerName(value: string) {
  return value.replace(/\s*\([A-Z]{3}\)\s*$/, "").trim().toLowerCase();
}

function playersMatch(a: string, b: string) {
  return normalizePlayerName(a) === normalizePlayerName(b);
}

function playerInSlot(userPick: string | null, officialSlot: string | null) {
  if (!userPick || !officialSlot) return false;
  return parsePlayerList(officialSlot).some((name) => playersMatch(userPick, name));
}

function parsePlayerList(value: string | null | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function matchOutcome(home: number, away: number) {
  if (home > away) return "HOME";
  if (home < away) return "AWAY";
  return "DRAW";
}

function scoreMatchPrediction(
  stage: MatchStage,
  predicted: { homeScore: number; awayScore: number; advancesTeamId?: string | null },
  actual: { homeScore: number; awayScore: number },
  matchTeams: {
    homeTeamId: string | null;
    awayTeamId: string | null;
    winnerTeamId: string | null;
  },
  config: Record<string, number>
) {
  const exact =
    predicted.homeScore === actual.homeScore &&
    predicted.awayScore === actual.awayScore;

  if (stage === MatchStage.GROUP) {
    const correct1x2 =
      matchOutcome(predicted.homeScore, predicted.awayScore) ===
      matchOutcome(actual.homeScore, actual.awayScore);
    if (!correct1x2) return 0;
    const base = config.group_match_1x2 ?? 3;
    return exact ? base + (config.group_match_exact_bonus ?? 2) : base;
  }

  const predWinner = resolveKnockoutWinner(
    predicted.homeScore,
    predicted.awayScore,
    matchTeams.homeTeamId,
    matchTeams.awayTeamId,
    predicted.advancesTeamId
  );
  const actualWinner = resolveKnockoutWinner(
    actual.homeScore,
    actual.awayScore,
    matchTeams.homeTeamId,
    matchTeams.awayTeamId,
    matchTeams.winnerTeamId
  );
  const correct1x2 = !!(predWinner && actualWinner && predWinner === actualWinner);

  const earlyKnockout = stage === MatchStage.ROUND_32 || stage === MatchStage.ROUND_16;
  const lateKnockout =
    stage === MatchStage.QUARTER ||
    stage === MatchStage.SEMI ||
    stage === MatchStage.THIRD_PLACE ||
    stage === MatchStage.FINAL;

  if (earlyKnockout) {
    if (!correct1x2) return 0;
    const base = config.ko_r32_r16_1x2 ?? 5;
    return exact ? base + (config.ko_r32_r16_exact_bonus ?? 3) : base;
  }

  if (lateKnockout) {
    if (!correct1x2) return 0;
    const base = config.ko_quarter_semi_1x2 ?? 8;
    return exact ? base + (config.ko_quarter_semi_exact_bonus ?? 4) : base;
  }

  return 0;
}

function scoreGroupStanding(
  prediction: {
    firstTeamId: string;
    secondTeamId: string;
    thirdTeamId: string;
  },
  official: {
    firstTeamId: string;
    secondTeamId: string;
    thirdTeamId: string;
  },
  config: Record<string, number>
) {
  let points = 0;

  const predictedTop2 = new Set([prediction.firstTeamId, prediction.secondTeamId]);
  const officialTop2 = new Set([official.firstTeamId, official.secondTeamId]);
  const top2Match =
    predictedTop2.size === 2 &&
    Array.from(predictedTop2).every((id) => officialTop2.has(id));

  if (top2Match) {
    points += config.group_standing_top2 ?? 4;
    if (
      prediction.firstTeamId === official.firstTeamId &&
      prediction.secondTeamId === official.secondTeamId
    ) {
      points += config.group_standing_top2_order_bonus ?? 3;
    }
  }

  if (prediction.thirdTeamId === official.thirdTeamId) {
    points += config.group_standing_third ?? 2;
  }

  return points;
}

function scoreGoldenBoot(
  prediction: { first: string | null; second: string | null; third: string | null },
  official: { first: string | null; second: string | null; third: string | null },
  config: Record<string, number>
) {
  let points = 0;
  const perHit = config.boot_top3_each ?? 10;
  const orderBonus = config.boot_order_bonus ?? 10;

  const top3Pool = new Set<string>();
  for (const slot of [official.first, official.second, official.third]) {
    for (const name of parsePlayerList(slot)) {
      top3Pool.add(normalizePlayerName(name));
    }
  }

  for (const pick of [prediction.first, prediction.second, prediction.third]) {
    if (pick && top3Pool.has(normalizePlayerName(pick))) {
      points += perHit;
    }
  }

  const orderExact =
    playerInSlot(prediction.first, official.first) &&
    playerInSlot(prediction.second, official.second) &&
    playerInSlot(prediction.third, official.third);

  if (orderExact) {
    points += orderBonus;
  }

  return points;
}

function scoreAwardSingle(
  predictionFirst: string | null,
  officialFirst: string | null,
  configPoints: number
) {
  if (predictionFirst && officialFirst && playersMatch(predictionFirst, officialFirst)) {
    return configPoints;
  }
  return 0;
}

function scoreFinalBracket(
  prediction: {
    championTeamId: string | null;
    runnerUpTeamId: string | null;
    thirdPlaceTeamId: string | null;
    fourthPlaceTeamId: string | null;
  },
  official: {
    championTeamId: string | null;
    runnerUpTeamId: string | null;
    thirdPlaceTeamId: string | null;
    fourthPlaceTeamId: string | null;
  },
  config: Record<string, number>
) {
  let points = 0;

  if (
    prediction.championTeamId &&
    official.championTeamId &&
    prediction.championTeamId === official.championTeamId
  ) {
    points += config.bracket_champion ?? 40;
  }
  if (
    prediction.runnerUpTeamId &&
    official.runnerUpTeamId &&
    prediction.runnerUpTeamId === official.runnerUpTeamId
  ) {
    points += config.bracket_runner_up ?? 25;
  }
  if (
    prediction.thirdPlaceTeamId &&
    official.thirdPlaceTeamId &&
    prediction.thirdPlaceTeamId === official.thirdPlaceTeamId
  ) {
    points += config.bracket_third ?? 15;
  }
  if (
    prediction.fourthPlaceTeamId &&
    official.fourthPlaceTeamId &&
    prediction.fourthPlaceTeamId === official.fourthPlaceTeamId
  ) {
    points += config.bracket_fourth ?? 15;
  }

  return points;
}

export async function recalculateAllScores() {
  const configRows = await prisma.scoringConfig.findMany();
  const config = Object.fromEntries(configRows.map((r) => [r.key, r.points]));

  const phase = await getTournamentPhaseState();

  const users = await prisma.user.findMany({
    where: PARTICIPANT_USER_WHERE,
    select: { id: true },
  });
  const matches = await prisma.match.findMany();
  const officialStandings = await prisma.officialGroupStanding.findMany();
  const officialThirds = await prisma.officialBestThird.findMany();
  const officialAwards = await prisma.officialAward.findMany();
  const officialBracket = await prisma.officialFinalBracket.findUnique({
    where: { id: "default" },
  });

  const scoreStandings = phase.lastGroupFinished;
  const scoreBestThirds = phase.lastGroupFinished && phase.officialThirdsReady;

  for (const user of users) {
    let matchPoints = 0;
    let standingPoints = 0;
    let bestThirdPoints = 0;
    let awardPoints = 0;
    let bracketPoints = 0;

    const predictions = await prisma.matchPrediction.findMany({
      where: { userId: user.id },
    });

    for (const prediction of predictions) {
      const match = matches.find((m) => m.id === prediction.matchId);
      if (!match || match.homeScore === null || match.awayScore === null) {
        await prisma.matchPrediction.update({
          where: { id: prediction.id },
          data: { points: 0 },
        });
        continue;
      }

      const points = scoreMatchPrediction(
        match.stage,
        prediction,
        { homeScore: match.homeScore, awayScore: match.awayScore },
        {
          homeTeamId: match.homeTeamId,
          awayTeamId: match.awayTeamId,
          winnerTeamId: match.winnerTeamId,
        },
        config
      );

      matchPoints += points;
      await prisma.matchPrediction.update({
        where: { id: prediction.id },
        data: { points },
      });
    }

    const standingPredictions = await prisma.groupStandingPrediction.findMany({
      where: { userId: user.id },
    });

    for (const prediction of standingPredictions) {
      if (!scoreStandings) {
        await prisma.groupStandingPrediction.update({
          where: { id: prediction.id },
          data: { points: 0 },
        });
        continue;
      }

      const official = officialStandings.find((s) => s.groupId === prediction.groupId);
      if (!official) {
        await prisma.groupStandingPrediction.update({
          where: { id: prediction.id },
          data: { points: 0 },
        });
        continue;
      }

      const points = scoreGroupStanding(prediction, official, config);

      standingPoints += points;
      await prisma.groupStandingPrediction.update({
        where: { id: prediction.id },
        data: { points },
      });
    }

    const bestThirdPredictions = await prisma.bestThirdPrediction.findMany({
      where: { userId: user.id },
    });
    const officialThirdIds = new Set(officialThirds.map((t) => t.teamId));

    for (const prediction of bestThirdPredictions) {
      const points =
        scoreBestThirds && officialThirdIds.has(prediction.teamId)
          ? (config.best_third ?? 3)
          : 0;
      bestThirdPoints += points;
      await prisma.bestThirdPrediction.update({
        where: { id: prediction.id },
        data: { points },
      });
    }

    const awardPredictions = await prisma.awardPrediction.findMany({
      where: { userId: user.id },
    });

    for (const prediction of awardPredictions) {
      const official = officialAwards.find((a) => a.category === prediction.category);
      if (!official) {
        await prisma.awardPrediction.update({
          where: { id: prediction.id },
          data: { points: 0 },
        });
        continue;
      }

      let points = 0;

      if (prediction.category === "GOLDEN_BOOT") {
        points = scoreGoldenBoot(prediction, official, config);
      } else if (prediction.category === "GOLDEN_BALL") {
        points = scoreAwardSingle(prediction.first, official.first, config.award_ball ?? 15);
      } else if (prediction.category === "GOLDEN_GLOVE") {
        points = scoreAwardSingle(prediction.first, official.first, config.award_glove ?? 15);
      } else if (prediction.category === "BEST_YOUNG") {
        points = scoreAwardSingle(prediction.first, official.first, config.award_young ?? 15);
      }

      awardPoints += points;
      await prisma.awardPrediction.update({
        where: { id: prediction.id },
        data: { points },
      });
    }

    const bracketPrediction = await prisma.finalBracketPrediction.findUnique({
      where: { userId: user.id },
    });

    if (bracketPrediction && officialBracket) {
      bracketPoints = scoreFinalBracket(bracketPrediction, officialBracket, config);
      await prisma.finalBracketPrediction.update({
        where: { userId: user.id },
        data: { points: bracketPoints },
      });
    } else if (bracketPrediction) {
      await prisma.finalBracketPrediction.update({
        where: { userId: user.id },
        data: { points: 0 },
      });
    }

    const totalPoints =
      matchPoints + standingPoints + bestThirdPoints + awardPoints + bracketPoints;

    await prisma.userScore.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        totalPoints,
        matchPoints,
        standingPoints,
        bestThirdPoints,
        awardPoints,
        bracketPoints,
      },
      update: {
        totalPoints,
        matchPoints,
        standingPoints,
        bestThirdPoints,
        awardPoints,
        bracketPoints,
      },
    });
  }
}

export async function getLeaderboard() {
  return prisma.user.findMany({
    where: PARTICIPANT_USER_WHERE,
    include: { score: true },
    orderBy: { score: { totalPoints: "desc" } },
  });
}

export async function getScoringRules() {
  return prisma.scoringConfig.findMany({ orderBy: { key: "asc" } });
}
