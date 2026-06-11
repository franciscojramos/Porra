import { prisma } from "./db";
import { deriveFinalBracketFromKnockout } from "./knockoutBracket";
import { getTournamentPhaseState } from "./tournamentPhase";

export async function isUserPhase1Locked(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { phase1Locked: true },
  });
  return user?.phase1Locked ?? false;
}

export async function isUserPhase2Locked(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { phase2Locked: true },
  });
  return user?.phase2Locked ?? false;
}

export async function canEditPhase1Predictions(
  targetUserId: string,
  actingUserId: string,
  actingIsAdmin: boolean,
  options?: { adminPanel?: boolean }
) {
  if (actingIsAdmin && options?.adminPanel) return true;
  if (targetUserId !== actingUserId) return false;
  return !(await isUserPhase1Locked(targetUserId));
}

export async function canEditPhase2Predictions(
  targetUserId: string,
  actingUserId: string,
  actingIsAdmin: boolean,
  options?: { adminPanel?: boolean }
) {
  if (actingIsAdmin && options?.adminPanel) return true;
  if (targetUserId !== actingUserId) return false;
  if (await isUserPhase2Locked(targetUserId)) return false;
  const phase = await getTournamentPhaseState();
  return phase.knockoutWindowOpen;
}

/** @deprecated use canEditPhase1Predictions or canEditPhase2Predictions */
export async function canEditUserPredictions(
  targetUserId: string,
  actingUserId: string,
  actingIsAdmin: boolean,
  options?: { adminPanel?: boolean; phase?: "phase1" | "phase2" }
) {
  if (options?.phase === "phase2") {
    return canEditPhase2Predictions(targetUserId, actingUserId, actingIsAdmin, options);
  }
  return canEditPhase1Predictions(targetUserId, actingUserId, actingIsAdmin, options);
}

export async function canEditOwnPhase1Predictions(userId: string) {
  return !(await isUserPhase1Locked(userId));
}

export async function getUserLockStatus(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      displayName: true,
      isAdmin: true,
      phase1Locked: true,
      phase1LockedAt: true,
      phase2Locked: true,
      phase2LockedAt: true,
      score: true,
    },
  });
}

export async function getCompletionStats(userId: string) {
  const [groupMatches, matchPredictions, groups, standingPredictions, bestThird, awards] =
    await Promise.all([
      prisma.match.count({ where: { stage: "GROUP" } }),
      prisma.matchPrediction.count({
        where: { userId, match: { stage: "GROUP" } },
      }),
      prisma.group.count(),
      prisma.groupStandingPrediction.count({ where: { userId } }),
      prisma.bestThirdPrediction.count({ where: { userId } }),
      prisma.awardPrediction.count({ where: { userId } }),
    ]);

  const [knockoutMatches, knockoutPredictions, phase] = await Promise.all([
    prisma.match.count({ where: { stage: { not: "GROUP" } } }),
    prisma.matchPrediction.count({
      where: { userId, match: { stage: { not: "GROUP" } } },
    }),
    getTournamentPhaseState(),
  ]);

  const derived =
    phase.phase2Open ? await deriveFinalBracketFromKnockout(userId) : null;
  const bracketComplete = !phase.phase2Open || (derived?.complete ?? false);

  const knockoutPhaseActive = phase.knockoutWindowOpen;

  const phase1Complete =
    matchPredictions >= groupMatches &&
    standingPredictions >= groups &&
    bestThird === 8 &&
    awards >= 4;

  const phase2Complete =
    !knockoutPhaseActive ||
    (knockoutPredictions >= knockoutMatches && bracketComplete);

  return {
    groupMatches,
    matchPredictions,
    groups,
    standingPredictions,
    bestThird,
    awards,
    knockoutMatches,
    knockoutPredictions,
    bracketComplete,
    knockoutPhaseActive,
    phase1Complete,
    phase2Complete,
    isComplete: phase1Complete && phase2Complete,
  };
}
