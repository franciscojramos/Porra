import { MatchStage } from "@prisma/client";
import { prisma } from "./db";
import { formatMadridDateTime } from "./madridTime";

const STAGE_LABELS: Record<MatchStage, string> = {
  GROUP: "Grupos",
  ROUND_32: "Dieciseisavos",
  ROUND_16: "Octavos",
  QUARTER: "Cuartos",
  SEMI: "Semifinales",
  THIRD_PLACE: "3º puesto",
  FINAL: "Final",
};

/** Orden de desbloqueo: cada ronda requiere resultados oficiales completos de la anterior. */
export const KNOCKOUT_STAGE_PROGRESSION: {
  stage: MatchStage;
  prerequisite: MatchStage | "PHASE2";
  firstMatchNumber: number;
}[] = [
  { stage: MatchStage.ROUND_32, prerequisite: "PHASE2", firstMatchNumber: 73 },
  { stage: MatchStage.ROUND_16, prerequisite: MatchStage.ROUND_32, firstMatchNumber: 89 },
  { stage: MatchStage.QUARTER, prerequisite: MatchStage.ROUND_16, firstMatchNumber: 97 },
  { stage: MatchStage.SEMI, prerequisite: MatchStage.QUARTER, firstMatchNumber: 101 },
  { stage: MatchStage.THIRD_PLACE, prerequisite: MatchStage.SEMI, firstMatchNumber: 103 },
  { stage: MatchStage.FINAL, prerequisite: MatchStage.SEMI, firstMatchNumber: 104 },
];

export type KnockoutStageEditState = {
  stage: MatchStage;
  label: string;
  editable: boolean;
  lockedReason: string | null;
  prerequisiteComplete: boolean;
  pastDeadline: boolean;
  closesAt: Date | null;
  closesAtLabel: string | null;
};

export async function isKnockoutStageOfficiallyComplete(
  stage: MatchStage
): Promise<boolean> {
  const matches = await prisma.match.findMany({
    where: { stage },
    select: { homeScore: true, awayScore: true },
  });
  return (
    matches.length > 0 &&
    matches.every((m) => m.homeScore !== null && m.awayScore !== null)
  );
}

async function getStageKickoffs(): Promise<Map<MatchStage, Date | null>> {
  const rows = await prisma.match.findMany({
    where: { stage: { not: MatchStage.GROUP } },
    select: { stage: true, matchNumber: true, kickoffAt: true },
    orderBy: { matchNumber: "asc" },
  });

  const map = new Map<MatchStage, Date | null>();
  for (const row of KNOCKOUT_STAGE_PROGRESSION) {
    const match = rows.find((m) => m.matchNumber === row.firstMatchNumber);
    map.set(row.stage, match?.kickoffAt ?? null);
  }
  return map;
}

async function isPhase2Open(): Promise<boolean> {
  const [lastGroupMatch, officialThirdCount] = await Promise.all([
    prisma.match.findFirst({
      where: { stage: "GROUP" },
      orderBy: [{ kickoffAt: "desc" }, { matchNumber: "desc" }],
      select: { homeScore: true, awayScore: true },
    }),
    prisma.officialBestThird.count(),
  ]);
  const lastGroupFinished =
    lastGroupMatch?.homeScore !== null && lastGroupMatch?.awayScore !== null;
  return lastGroupFinished && officialThirdCount === 8;
}

export async function getKnockoutStageEditStates(options?: {
  adminPanel?: boolean;
}): Promise<KnockoutStageEditState[]> {
  const phase2Open = await isPhase2Open();
  const now = Date.now();
  const kickoffs = await getStageKickoffs();

  const completionCache = new Map<MatchStage | "PHASE2", boolean>();
  completionCache.set("PHASE2", phase2Open);

  async function isPrerequisiteComplete(
    prerequisite: MatchStage | "PHASE2"
  ): Promise<boolean> {
    if (completionCache.has(prerequisite)) {
      return completionCache.get(prerequisite)!;
    }
    const done = await isKnockoutStageOfficiallyComplete(prerequisite as MatchStage);
    completionCache.set(prerequisite, done);
    return done;
  }

  const states: KnockoutStageEditState[] = [];

  for (const row of KNOCKOUT_STAGE_PROGRESSION) {
    const prerequisiteComplete = await isPrerequisiteComplete(row.prerequisite);
    const closesAt = kickoffs.get(row.stage) ?? null;
    const pastDeadline = closesAt ? now >= closesAt.getTime() : false;

    const editable =
      !!options?.adminPanel ||
      (phase2Open && prerequisiteComplete && !pastDeadline);

    let lockedReason: string | null = null;
    if (!options?.adminPanel) {
      if (!phase2Open) {
        lockedReason = "La Fase 2 aún no está abierta.";
      } else if (!prerequisiteComplete) {
        if (row.prerequisite === "PHASE2") {
          lockedReason = "Esperando cierre de grupos y mejores terceros oficiales.";
        } else {
          lockedReason = `Esperando todos los resultados oficiales de ${STAGE_LABELS[row.prerequisite]}.`;
        }
      } else if (pastDeadline) {
        lockedReason = `Plazo cerrado (inicio del partido #${row.firstMatchNumber}).`;
      }
    }

    states.push({
      stage: row.stage,
      label: STAGE_LABELS[row.stage],
      editable,
      lockedReason,
      prerequisiteComplete,
      pastDeadline,
      closesAt,
      closesAtLabel: closesAt ? formatMadridDateTime(closesAt) : null,
    });
  }

  return states;
}

export async function canEditKnockoutMatchStage(
  stage: MatchStage,
  options?: { adminPanel?: boolean }
): Promise<boolean> {
  const states = await getKnockoutStageEditStates(options);
  return states.find((s) => s.stage === stage)?.editable ?? false;
}

export async function isAnyKnockoutStageEditable(options?: {
  adminPanel?: boolean;
}): Promise<boolean> {
  const states = await getKnockoutStageEditStates(options);
  return states.some((s) => s.editable);
}

export async function getEditableKnockoutStages(options?: {
  adminPanel?: boolean;
}): Promise<MatchStage[]> {
  const states = await getKnockoutStageEditStates(options);
  return states.filter((s) => s.editable).map((s) => s.stage);
}

export async function buildOfficialKnockoutWinnersLosers(): Promise<{
  winners: Map<number, string>;
  losers: Map<number, string>;
}> {
  const { resolveKnockoutWinner, resolveSlotLabel } = await import(
    "./knockoutBracketResolve"
  );

  const [standingRows, thirds, matches] = await Promise.all([
    prisma.officialGroupStanding.findMany(),
    prisma.officialBestThird.findMany(),
    prisma.match.findMany({
      where: { stage: { not: MatchStage.GROUP } },
      orderBy: { matchNumber: "asc" },
    }),
  ]);

  const standings = Object.fromEntries(
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
  const bestThirdIds = new Set(thirds.map((t) => t.teamId));
  const winners = new Map<number, string>();
  const losers = new Map<number, string>();

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
  }

  return { winners, losers };
}
