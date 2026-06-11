import { prisma } from "./db";
import { getSession } from "./auth";
import { getOfficialResults } from "./official";
import { deriveFinalBracketFromKnockout } from "./knockoutBracket";
import { getTournamentPhaseState } from "./tournamentPhase";
import { MatchStage } from "@prisma/client";

async function getPredictionsForUser(userId: string | undefined) {
  if (!userId) {
    return {
      matchPredictions: {} as Record<string, { homeScore: number; awayScore: number; points: number }>,
      standingPredictions: {} as Record<string, { firstTeamId: string; secondTeamId: string; thirdTeamId: string; fourthTeamId: string; points: number }>,
      bestThirdTeamIds: new Set<string>(),
      awardPredictions: {} as Record<string, { first: string | null; second: string | null; third: string | null; points: number }>,
    };
  }

  const [matchPredictions, standingPredictions, bestThirdPredictions, awardPredictions] =
    await Promise.all([
      prisma.matchPrediction.findMany({ where: { userId } }),
      prisma.groupStandingPrediction.findMany({ where: { userId } }),
      prisma.bestThirdPrediction.findMany({ where: { userId } }),
      prisma.awardPrediction.findMany({ where: { userId } }),
    ]);

  return {
    matchPredictions: Object.fromEntries(matchPredictions.map((p) => [p.matchId, p])),
    standingPredictions: Object.fromEntries(standingPredictions.map((p) => [p.groupId, p])),
    bestThirdTeamIds: new Set(bestThirdPredictions.map((p) => p.teamId)),
    awardPredictions: Object.fromEntries(awardPredictions.map((p) => [p.category, p])),
  };
}

export async function getGroupsWithData(
  forUserId?: string,
  options?: { adminEdit?: boolean }
) {
  const session = await getSession();
  const userId = forUserId ?? session?.id;

  const groups = await prisma.group.findMany({
    orderBy: { id: "asc" },
    include: {
      teams: { include: { team: true }, orderBy: { position: "asc" } },
      matches: { orderBy: { matchNumber: "asc" } },
    },
  });

  const teams = await prisma.team.findMany({ orderBy: { name: "asc" } });
  const teamMap = Object.fromEntries(teams.map((t) => [t.id, t]));

  const predictions = await getPredictionsForUser(userId);
  const user = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: { phase1Locked: true, displayName: true },
      })
    : null;

  const phase1Locked = user?.phase1Locked ?? false;
  const editable =
    !!session &&
    (options?.adminEdit && session.isAdmin
      ? true
      : session.id === userId && !phase1Locked);

  return {
    groups,
    teams,
    teamMap,
    userId,
    locked: phase1Locked,
    phase1Locked,
    editable: !!editable,
    isOwnProfile: session?.id === userId,
    predictedThirdTeams: Object.entries(predictions.standingPredictions)
      .map(([groupId, standing]) => {
        const team = teamMap[standing.thirdTeamId];
        return team ? { groupId, team } : null;
      })
      .filter(Boolean) as { groupId: string; team: (typeof teams)[0] }[],
    ...predictions,
  };
}

export async function getKnockoutMatches(
  forUserId?: string,
  options?: { adminEdit?: boolean }
) {
  const session = await getSession();
  const userId = forUserId ?? session?.id;

  const stages: MatchStage[] = [
    MatchStage.ROUND_32,
    MatchStage.ROUND_16,
    MatchStage.QUARTER,
    MatchStage.SEMI,
    MatchStage.THIRD_PLACE,
    MatchStage.FINAL,
  ];

  const matches = await prisma.match.findMany({
    where: { stage: { in: stages } },
    orderBy: { matchNumber: "asc" },
  });

  const teams = await prisma.team.findMany();
  const teamMap = Object.fromEntries(teams.map((t) => [t.id, t]));

  const predictions = userId
    ? await prisma.matchPrediction.findMany({ where: { userId } })
    : [];

  const finalBracket = userId
    ? await prisma.finalBracketPrediction.findUnique({ where: { userId } })
    : null;

  const user = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: { phase1Locked: true, phase2Locked: true },
      })
    : null;

  const phase1Locked = user?.phase1Locked ?? false;
  const phase2Locked = user?.phase2Locked ?? false;
  const phase = await getTournamentPhaseState();
  const adminPanel = !!(options?.adminEdit && session?.isAdmin);
  const knockoutEditable =
    !!session &&
    (adminPanel
      ? true
      : session.id === userId && !phase2Locked && phase.knockoutWindowOpen);

  const derivedBracket =
    userId && phase.phase2Open
      ? await deriveFinalBracketFromKnockout(userId)
      : null;

  const [standingRows, bestThirdRows] = userId
    ? await Promise.all([
        prisma.groupStandingPrediction.findMany({ where: { userId } }),
        prisma.bestThirdPrediction.findMany({ where: { userId } }),
      ])
    : [[], []];

  const userStandings = Object.fromEntries(
    standingRows.map((s) => [
      s.groupId,
      {
        firstTeamId: s.firstTeamId,
        secondTeamId: s.secondTeamId,
        thirdTeamId: s.thirdTeamId,
        fourthTeamId: s.fourthTeamId,
      },
    ])
  );
  const userBestThirdIds = bestThirdRows.map((t) => t.teamId);

  const stageLabels: Record<MatchStage, string> = {
    GROUP: "Grupos",
    ROUND_32: "Dieciseisavos de final",
    ROUND_16: "Octavos de final",
    QUARTER: "Cuartos de final",
    SEMI: "Semifinales",
    THIRD_PLACE: "3º y 4º puesto",
    FINAL: "Final",
  };

  return {
    matches,
    teamMap,
    userId,
    locked: phase2Locked,
    phase1Locked,
    phase2Locked,
    editable: knockoutEditable,
    phase,
    predictions: Object.fromEntries(predictions.map((p) => [p.matchId, p])),
    finalBracket,
    derivedBracket,
    stageLabels,
    userStandings,
    userBestThirdIds,
  };
}

export async function getAwardsData(
  forUserId?: string,
  options?: { adminEdit?: boolean }
) {
  const session = await getSession();
  const userId = forUserId ?? session?.id;

  const predictions = userId
    ? await prisma.awardPrediction.findMany({ where: { userId } })
    : [];

  const user = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: { phase1Locked: true },
      })
    : null;

  const phase1Locked = user?.phase1Locked ?? false;
  const editable =
    !!session &&
    (options?.adminEdit && session.isAdmin
      ? true
      : session.id === userId && !phase1Locked);

  return {
    userId,
    locked: phase1Locked,
    phase1Locked,
    editable: !!editable,
    predictions: Object.fromEntries(predictions.map((p) => [p.category, p])),
  };
}

export async function getAllUsers() {
  return prisma.user.findMany({
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
    orderBy: { displayName: "asc" },
  });
}

export async function getUserProfile(
  userId: string,
  options?: { adminEdit?: boolean }
) {
  const user = await prisma.user.findUnique({
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

  if (!user) return null;

  const [groupsData, knockoutData, awardsData, officialResults] = await Promise.all([
    getGroupsWithData(userId, options),
    getKnockoutMatches(userId, options),
    getAwardsData(userId, options),
    getOfficialResults(),
  ]);

  return { user, groupsData, knockoutData, awardsData, officialResults };
}

export async function getAdminData() {
  const users = await prisma.user.findMany({
    include: { score: true },
    orderBy: { displayName: "asc" },
  });

  const groups = await prisma.group.findMany({
    include: { teams: { include: { team: true }, orderBy: { position: "asc" } } },
    orderBy: { id: "asc" },
  });

  const matches = await prisma.match.findMany({ orderBy: { matchNumber: "asc" } });
  const teams = await prisma.team.findMany({ orderBy: { name: "asc" } });
  const teamMap = Object.fromEntries(teams.map((t) => [t.id, t]));
  const officialStandings = await prisma.officialGroupStanding.findMany();
  const officialThirds = await prisma.officialBestThird.findMany();
  const officialAwards = await prisma.officialAward.findMany();
  const officialFinalBracket = await prisma.officialFinalBracket.findUnique({
    where: { id: "default" },
  });
  const scoringRules = await prisma.scoringConfig.findMany();

  return {
    users,
    groups,
    matches,
    teams,
    teamMap,
    officialStandings: Object.fromEntries(
      officialStandings.map((s) => [s.groupId, s])
    ),
    officialThirdIds: new Set(officialThirds.map((t) => t.teamId)),
    officialThirdPlaceIds: new Set(
      officialStandings.map((s) => s.thirdTeamId).filter(Boolean)
    ),
    officialAwards: Object.fromEntries(
      officialAwards.map((a) => [a.category, a])
    ),
    officialFinalBracket,
    scoringRules,
  };
}
