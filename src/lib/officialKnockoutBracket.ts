import { prisma } from "./db";
import { MatchStage } from "@prisma/client";
import { resolveKnockoutWinner } from "./knockoutBracketResolve";

type StandingByGroup = Record<
  string,
  { firstTeamId: string; secondTeamId: string; thirdTeamId: string; fourthTeamId: string }
>;

function resolveSlotLabel(
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

async function loadOfficialStandings(): Promise<{
  standings: StandingByGroup;
  bestThirdIds: Set<string>;
}> {
  const [standingRows, thirds] = await Promise.all([
    prisma.officialGroupStanding.findMany(),
    prisma.officialBestThird.findMany(),
  ]);

  return {
    standings: Object.fromEntries(
      standingRows.map((s) => [
        s.groupId,
        {
          firstTeamId: s.firstTeamId,
          secondTeamId: s.secondTeamId,
          thirdTeamId: s.thirdTeamId,
          fourthTeamId: s.fourthTeamId,
        },
      ])
    ),
    bestThirdIds: new Set(thirds.map((t) => t.teamId)),
  };
}

/** Rellena homeTeamId/awayTeamId en eliminatorias según clasificación y resultados oficiales. */
export async function syncOfficialKnockoutBracket() {
  const { standings, bestThirdIds } = await loadOfficialStandings();
  if (Object.keys(standings).length < 12 || bestThirdIds.size !== 8) {
    return { updated: 0, ready: false };
  }

  const matches = await prisma.match.findMany({
    where: { stage: { not: MatchStage.GROUP } },
    orderBy: { matchNumber: "asc" },
  });

  const winners = new Map<number, string>();
  const losers = new Map<number, string>();
  let updated = 0;

  for (const match of matches) {
    const homeTeamId = resolveSlotLabel(
      match.homeLabel,
      standings,
      bestThirdIds,
      winners,
      losers
    );
    const awayTeamId = resolveSlotLabel(
      match.awayLabel,
      standings,
      bestThirdIds,
      winners,
      losers
    );

    if (
      match.homeScore !== null &&
      match.awayScore !== null &&
      homeTeamId &&
      awayTeamId
    ) {
      const winnerId = resolveKnockoutWinner(
        match.homeScore,
        match.awayScore,
        homeTeamId,
        awayTeamId,
        match.winnerTeamId
      );
      if (winnerId) {
        const loserId = winnerId === homeTeamId ? awayTeamId : homeTeamId;
        winners.set(match.matchNumber, winnerId);
        losers.set(match.matchNumber, loserId);
      }
    }

    if (homeTeamId !== match.homeTeamId || awayTeamId !== match.awayTeamId) {
      await prisma.match.update({
        where: { id: match.id },
        data: { homeTeamId, awayTeamId },
      });
      updated++;
    }
  }

  return { updated, ready: true };
}

export async function getOfficialThirdPlaceTeams() {
  const standings = await prisma.officialGroupStanding.findMany({
    orderBy: { groupId: "asc" },
  });
  return standings.map((s) => s.thirdTeamId);
}
