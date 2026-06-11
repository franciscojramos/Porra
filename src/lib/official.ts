import { prisma } from "./db";
import { AwardCategory } from "@prisma/client";

export async function getOfficialResults() {
  const [officialStandings, officialThirds, officialAwards, officialFinalBracket, teams] =
    await Promise.all([
    prisma.officialGroupStanding.findMany(),
    prisma.officialBestThird.findMany(),
    prisma.officialAward.findMany(),
    prisma.officialFinalBracket.findUnique({ where: { id: "default" } }),
    prisma.team.findMany(),
  ]);

  const teamMap = Object.fromEntries(teams.map((t) => [t.id, t]));

  return {
    standingsByGroup: Object.fromEntries(officialStandings.map((s) => [s.groupId, s])),
    officialThirdIds: new Set(officialThirds.map((t) => t.teamId)),
    officialThirdTeams: officialThirds
      .map((t) => teamMap[t.teamId])
      .filter(Boolean) as { id: string; name: string; code: string }[],
    awards: Object.fromEntries(officialAwards.map((a) => [a.category, a])) as Record<
      AwardCategory,
      { category: AwardCategory; first: string | null; second: string | null; third: string | null }
    >,
    officialFinalBracket,
    teamMap,
    hasStandings: officialStandings.length > 0,
    hasThirds: officialThirds.length > 0,
    hasAwards: officialAwards.some((a) => a.first || a.second || a.third),
    hasFinalBracket: !!(
      officialFinalBracket?.championTeamId ||
      officialFinalBracket?.runnerUpTeamId ||
      officialFinalBracket?.thirdPlaceTeamId ||
      officialFinalBracket?.fourthPlaceTeamId
    ),
  };
}
