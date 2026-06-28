import { prisma } from "./db";
import { formatMadridDateTime } from "./madridTime";
import { isAnyKnockoutStageEditable } from "./knockoutRoundUnlock";

export type TournamentPhaseState = {
  /** Admin: último partido de grupos con resultado + 8 terceros oficiales */
  phase2Open: boolean;
  /** Todas las rondas de eliminatorias han pasado su plazo de pronóstico */
  phase2Closed: boolean;
  /** Hay al menos una ronda de eliminatorias editable ahora mismo */
  knockoutWindowOpen: boolean;
  lastGroupFinished: boolean;
  officialThirdsReady: boolean;
  lastGroupMatch: {
    matchNumber: number;
    kickoffAt: Date | null;
    homeScore: number | null;
    awayScore: number | null;
  } | null;
  firstKnockoutMatch: {
    matchNumber: number;
    kickoffAt: Date | null;
  } | null;
  opensAtLabel: string;
  closesAtLabel: string;
};

export async function getTournamentPhaseState(): Promise<TournamentPhaseState> {
  const [lastGroupMatch, firstKnockoutMatch, officialThirdCount, knockoutWindowOpen] =
    await Promise.all([
    prisma.match.findFirst({
      where: { stage: "GROUP" },
      orderBy: [{ kickoffAt: "desc" }, { matchNumber: "desc" }],
      select: {
        matchNumber: true,
        kickoffAt: true,
        homeScore: true,
        awayScore: true,
      },
    }),
    prisma.match.findFirst({
      where: { stage: { not: "GROUP" } },
      orderBy: [{ kickoffAt: "asc" }, { matchNumber: "asc" }],
      select: { matchNumber: true, kickoffAt: true },
    }),
    prisma.officialBestThird.count(),
    isAnyKnockoutStageEditable(),
  ]);

  const lastGroupFinished =
    lastGroupMatch?.homeScore !== null && lastGroupMatch?.awayScore !== null;
  const officialThirdsReady = officialThirdCount === 8;

  const phase2Open = lastGroupFinished && officialThirdsReady;
  const phase2Closed = phase2Open && !knockoutWindowOpen;

  return {
    phase2Open,
    phase2Closed,
    knockoutWindowOpen,
    lastGroupFinished,
    officialThirdsReady,
    lastGroupMatch,
    firstKnockoutMatch,
    opensAtLabel: lastGroupMatch
      ? `Tras el partido #${lastGroupMatch.matchNumber} y los 8 mejores terceros oficiales`
      : "Tras cerrar la fase de grupos",
    closesAtLabel: firstKnockoutMatch?.kickoffAt
      ? formatMadridDateTime(firstKnockoutMatch.kickoffAt)
      : "Inicio de dieciseisavos",
  };
}

export async function canEditKnockoutPredictions(options?: {
  adminPanel?: boolean;
  userPhase2Locked?: boolean;
}) {
  if (options?.adminPanel) return true;
  if (options?.userPhase2Locked) return false;
  const phase = await getTournamentPhaseState();
  return phase.knockoutWindowOpen;
}
