import { AwardCategory } from "@prisma/client";
import { prisma } from "./db";
import { PARTICIPANT_USER_WHERE } from "./participants";
import { displayPlayerLabel, normalizePlayerKey, parseScorers } from "./players";

export type StatRow = {
  label: string;
  count: number;
  percent: number;
};

export type AwardStatSlot = {
  slotLabel: string;
  voters: number;
  rows: StatRow[];
};

export type AwardStatBlock = {
  category: AwardCategory;
  title: string;
  description: string;
  slots: AwardStatSlot[];
};

const AWARD_META: Record<
  AwardCategory,
  { title: string; description: string; slots: { key: "first" | "second" | "third"; label: string }[] }
> = {
  GOLDEN_BALL: {
    title: "Balón de Oro",
    description: "Mejor jugador del torneo",
    slots: [{ key: "first", label: "Elección" }],
  },
  GOLDEN_BOOT: {
    title: "Bota de Oro",
    description: "Máximos goleadores predichos",
    slots: [
      { key: "first", label: "1º goleador" },
      { key: "second", label: "2º goleador" },
      { key: "third", label: "3º goleador" },
    ],
  },
  GOLDEN_GLOVE: {
    title: "Guante de Oro",
    description: "Mejor portero del torneo",
    slots: [{ key: "first", label: "Elección" }],
  },
  BEST_YOUNG: {
    title: "Mejor jugador joven",
    description: "Jugadores nacidos en 2005 o después",
    slots: [{ key: "first", label: "Elección" }],
  },
};

function aggregateVotes(
  picks: (string | null | undefined)[],
  limit = 10
): { voters: number; rows: StatRow[] } {
  const map = new Map<string, { label: string; count: number }>();
  let voters = 0;

  for (const pick of picks) {
    if (!pick?.trim()) continue;
    voters++;
    const key = normalizePlayerKey(pick);
    const existing = map.get(key);
    if (existing) {
      existing.count++;
    } else {
      map.set(key, { label: displayPlayerLabel(pick), count: 1 });
    }
  }

  const rows = Array.from(map.values())
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "es"))
    .slice(0, limit)
    .map(({ label, count }) => ({
      label,
      count,
      percent: voters > 0 ? Math.round((count / voters) * 100) : 0,
    }));

  return { voters, rows };
}

export async function getAwardPredictionStats(): Promise<AwardStatBlock[]> {
  const predictions = await prisma.awardPrediction.findMany({
    where: { user: PARTICIPANT_USER_WHERE },
    select: { category: true, first: true, second: true, third: true },
  });

  const byCategory = Object.fromEntries(
    (Object.keys(AWARD_META) as AwardCategory[]).map((category) => [category, [] as typeof predictions])
  ) as Record<AwardCategory, typeof predictions>;

  for (const prediction of predictions) {
    byCategory[prediction.category].push(prediction);
  }

  return (Object.keys(AWARD_META) as AwardCategory[]).map((category) => {
    const meta = AWARD_META[category];
    const rows = byCategory[category];

    return {
      category,
      title: meta.title,
      description: meta.description,
      slots: meta.slots.map((slot) => {
        const { voters, rows: statRows } = aggregateVotes(
          rows.map((p) => p[slot.key])
        );
        return { slotLabel: slot.label, voters, rows: statRows };
      }),
    };
  });
}

export async function getRealGoalScorerStats(limit = 10): Promise<{
  finishedMatches: number;
  scorers: StatRow[];
}> {
  const matches = await prisma.match.findMany({
    where: {
      homeScore: { not: null },
      awayScore: { not: null },
    },
    select: { scorersHome: true, scorersAway: true },
  });

  const map = new Map<string, { label: string; goals: number }>();

  for (const match of matches) {
    for (const scorer of [
      ...parseScorers(match.scorersHome),
      ...parseScorers(match.scorersAway),
    ]) {
      const key = normalizePlayerKey(scorer);
      const existing = map.get(key);
      if (existing) {
        existing.goals++;
      } else {
        map.set(key, { label: displayPlayerLabel(scorer), goals: 1 });
      }
    }
  }

  const totalGoals = Array.from(map.values()).reduce((sum, row) => sum + row.goals, 0);

  const scorers = Array.from(map.values())
    .sort((a, b) => b.goals - a.goals || a.label.localeCompare(b.label, "es"))
    .slice(0, limit)
    .map(({ label, goals }) => ({
      label,
      count: goals,
      percent: totalGoals > 0 ? Math.round((goals / totalGoals) * 100) : 0,
    }));

  return { finishedMatches: matches.length, scorers };
}

export async function getStatisticsPageData() {
  const [awardStats, goalStats] = await Promise.all([
    getAwardPredictionStats(),
    getRealGoalScorerStats(),
  ]);

  return { awardStats, goalStats };
}
