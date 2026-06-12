import { prisma } from "./db";
import { PARTICIPANT_USER_WHERE } from "./participants";
import { computeGroupStandings } from "./standings";
import { getMatchStatus, madridDateKey } from "./madridTime";

export async function getAllMatchesWithTeams() {
  const [matches, teams] = await Promise.all([
    prisma.match.findMany({ orderBy: { matchNumber: "asc" } }),
    prisma.team.findMany(),
  ]);

  const teamMap = Object.fromEntries(teams.map((t) => [t.id, t]));
  return { matches, teamMap, teams };
}

export async function getHomeDashboard() {
  const { matches, teamMap } = await getAllMatchesWithTeams();

  const groups = await prisma.group.findMany({
    orderBy: { id: "asc" },
    include: {
      teams: { include: { team: true }, orderBy: { position: "asc" } },
      matches: { orderBy: { matchNumber: "asc" } },
    },
  });

  const matchesWithStatus = matches.map((m) => ({
    ...m,
    status: getMatchStatus(m),
  }));

  const liveMatch = matchesWithStatus.find((m) => m.status === "live");
  const nextMatch =
    matchesWithStatus.find((m) => m.status === "upcoming") ??
    matchesWithStatus.find((m) => m.status === "scheduled");

  const featured = liveMatch ?? nextMatch ?? null;

  const byDay = new Map<string, typeof matchesWithStatus>();
  for (const match of matchesWithStatus) {
    if (!match.kickoffAt) continue;
    const key = madridDateKey(match.kickoffAt);
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(match);
  }

  const days = Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, dayMatches]) => ({ date, matches: dayMatches }));

  const groupStandings = groups.map((group) => {
    const teamIds = group.teams.map((gt) => gt.teamId);
    const standings = computeGroupStandings(teamIds, group.matches);
    return {
      groupId: group.id,
      rows: standings.map((row, index) => ({
        position: index + 1,
        team: group.teams.find((gt) => gt.teamId === row.teamId)?.team,
        ...row,
      })),
    };
  });

  return {
    featured,
    liveMatch,
    nextMatch,
    days,
    groupStandings,
    teamMap,
    totalFinished: matchesWithStatus.filter((m) => m.status === "finished").length,
    totalMatches: matches.length,
  };
}

export async function getMatchDetail(matchNumber: number) {
  const match = await prisma.match.findUnique({
    where: { matchNumber },
    include: {
      group: {
        include: { teams: { include: { team: true }, orderBy: { position: "asc" } } },
      },
      predictions: {
        where: { user: PARTICIPANT_USER_WHERE },
        include: {
          user: {
            select: { id: true, displayName: true, username: true },
          },
        },
        orderBy: { points: "desc" },
      },
    },
  });

  if (!match) return null;

  const teams = await prisma.team.findMany();
  const teamMap = Object.fromEntries(teams.map((t) => [t.id, t]));

  return {
    match: { ...match, status: getMatchStatus(match) },
    teamMap,
    predictions: match.predictions,
  };
}

export function getPredictedThirdTeams(
  standingPredictions: Record<string, { thirdTeamId: string }>,
  teamMap: Record<string, { id: string; name: string; code: string; groupId?: string }>
) {
  return Object.entries(standingPredictions)
    .map(([groupId, standing]) => {
      const team = teamMap[standing.thirdTeamId];
      if (!team) return null;
      return { groupId, team };
    })
    .filter(Boolean) as { groupId: string; team: { id: string; name: string; code: string } }[];
}
