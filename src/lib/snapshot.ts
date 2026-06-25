import { prisma } from "./db";
import { getAllMatchesWithTeams } from "./dashboard";
import { formatMadridDateTime, getMatchStatus } from "./madridTime";
import { getMatchAwayName, getMatchHomeName } from "./matchDisplay";
import { PARTICIPANT_USER_WHERE } from "./participants";
import { getLeaderboard } from "./scoring";

export type SnapshotMatch = {
  matchNumber: number;
  homeName: string;
  awayName: string;
  kickoffLabel: string;
  predictions: { displayName: string; homeScore: number; awayScore: number }[];
};

export type SnapshotExportData = {
  generatedAt: string;
  leaderboard: { position: number; displayName: string; points: number }[];
  upcomingMatches: SnapshotMatch[];
};

export async function getSnapshotExportData(): Promise<SnapshotExportData> {
  const [users, { matches, teamMap }] = await Promise.all([
    getLeaderboard(),
    getAllMatchesWithTeams(),
  ]);

  const upcoming = matches
    .map((match) => ({ match, status: getMatchStatus(match) }))
    .filter(({ status }) => status === "upcoming" || status === "scheduled")
    .sort((a, b) => (a.match.kickoffAt?.getTime() ?? 0) - (b.match.kickoffAt?.getTime() ?? 0))
    .slice(0, 4)
    .map(({ match }) => match);

  const matchIds = upcoming.map((m) => m.id);

  const predictions = matchIds.length
    ? await prisma.matchPrediction.findMany({
        where: {
          matchId: { in: matchIds },
          user: PARTICIPANT_USER_WHERE,
        },
        include: {
          user: { select: { displayName: true } },
        },
        orderBy: { user: { displayName: "asc" } },
      })
    : [];

  const predictionsByMatch = new Map<string, SnapshotMatch["predictions"]>();
  for (const pred of predictions) {
    const list = predictionsByMatch.get(pred.matchId) ?? [];
    list.push({
      displayName: pred.user.displayName,
      homeScore: pred.homeScore,
      awayScore: pred.awayScore,
    });
    predictionsByMatch.set(pred.matchId, list);
  }

  const generatedAt = new Intl.DateTimeFormat("es-ES", {
    timeZone: "Europe/Madrid",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  return {
    generatedAt,
    leaderboard: users.map((user, index) => ({
      position: index + 1,
      displayName: user.displayName,
      points: user.score?.totalPoints ?? 0,
    })),
    upcomingMatches: upcoming.map((match) => ({
      matchNumber: match.matchNumber,
      homeName: getMatchHomeName(match, teamMap),
      awayName: getMatchAwayName(match, teamMap),
      kickoffLabel: formatMadridDateTime(match.kickoffAt),
      predictions: predictionsByMatch.get(match.id) ?? [],
    })),
  };
}
