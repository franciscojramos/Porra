import { MatchStage } from "@prisma/client";
import { prisma } from "@/lib/db";
import { afterOfficialResultsUpdate } from "@/lib/afterOfficialUpdate";
import { fetchFootballDataMatch } from "./client";
import { getFootballDataMatchId } from "./matchIds";
import { mapFootballDataScore } from "./mapScore";

/** Minutos tras el inicio antes de empezar a consultar la API (90' + margen). */
const MINUTES_BEFORE_FIRST_POLL = 105;
/** Margen extra en eliminatorias por posible prórroga. */
const KNOCKOUT_EXTRA_MINUTES = 30;

export type SyncMatchResult =
  | { status: "skipped"; reason: string; matchNumber: number }
  | { status: "pending"; reason: string; matchNumber: number }
  | { status: "imported"; matchNumber: number; homeScore: number; awayScore: number }
  | { status: "error"; matchNumber: number; error: string };

function isReadyToPoll(kickoffAt: Date, stage: MatchStage, now: Date) {
  const extra = stage === MatchStage.GROUP ? 0 : KNOCKOUT_EXTRA_MINUTES;
  const pollAfterMs = (MINUTES_BEFORE_FIRST_POLL + extra) * 60 * 1000;
  return now.getTime() >= kickoffAt.getTime() + pollAfterMs;
}

function resolveWinnerTeamId(
  winnerSide: "HOME" | "AWAY" | null,
  homeTeamId: string | null,
  awayTeamId: string | null
) {
  if (winnerSide === "HOME") return homeTeamId;
  if (winnerSide === "AWAY") return awayTeamId;
  return null;
}

export async function syncMatchResultFromApi(
  matchNumber: number,
  options?: { skipTimeCheck?: boolean; skipRecalc?: boolean }
): Promise<SyncMatchResult> {
  const match = await prisma.match.findUnique({
    where: { matchNumber },
    include: {
      group: true,
    },
  });

  if (!match) {
    return { status: "skipped", reason: "Partido no encontrado", matchNumber };
  }

  if (match.scoreManuallyEdited) {
    return { status: "skipped", reason: "Marcador editado manualmente", matchNumber };
  }

  if (match.homeScore !== null && match.awayScore !== null) {
    return { status: "skipped", reason: "Ya tiene resultado", matchNumber };
  }

  if (!match.kickoffAt) {
    return { status: "skipped", reason: "Sin hora de inicio", matchNumber };
  }

  const now = new Date();
  if (!options?.skipTimeCheck && !isReadyToPoll(match.kickoffAt, match.stage, now)) {
    return { status: "pending", reason: "Aún no toca consultar", matchNumber };
  }

  const apiId = getFootballDataMatchId(matchNumber);
  if (!apiId) {
    return { status: "skipped", reason: "Sin id de API", matchNumber };
  }

  try {
    const apiMatch = await fetchFootballDataMatch(apiId);
    if (!apiMatch) {
      return { status: "error", matchNumber, error: "Partido no encontrado en API" };
    }

    if (apiMatch.status !== "FINISHED") {
      return { status: "pending", reason: `Estado API: ${apiMatch.status}`, matchNumber };
    }

    const mapped = mapFootballDataScore(apiMatch.score, match.stage);
    let winnerTeamId: string | null = null;

    if (match.stage !== MatchStage.GROUP) {
      if (mapped.homeScore !== mapped.awayScore) {
        winnerTeamId = null;
      } else {
        winnerTeamId = resolveWinnerTeamId(
          mapped.winnerSide,
          match.homeTeamId,
          match.awayTeamId
        );
        if (!winnerTeamId && match.homeTeamId && match.awayTeamId) {
          return {
            status: "pending",
            reason: "Empate en API sin ganador resuelto (equipos KO pendientes)",
            matchNumber,
          };
        }
      }
    }

    await prisma.match.update({
      where: { id: match.id },
      data: {
        homeScore: mapped.homeScore,
        awayScore: mapped.awayScore,
        winnerTeamId,
      },
    });

    if (!options?.skipRecalc) {
      await afterOfficialResultsUpdate(matchNumber);
    }

    return {
      status: "imported",
      matchNumber,
      homeScore: mapped.homeScore,
      awayScore: mapped.awayScore,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { status: "error", matchNumber, error: message };
  }
}

export async function syncPendingMatchResults(options?: {
  skipTimeCheck?: boolean;
}): Promise<SyncMatchResult[]> {
  if (!process.env.FOOTBALL_DATA_TOKEN) {
    throw new Error("FOOTBALL_DATA_TOKEN no configurado");
  }

  const now = new Date();
  const pending = await prisma.match.findMany({
    where: {
      homeScore: null,
      scoreManuallyEdited: false,
      kickoffAt: { not: null },
    },
    orderBy: { matchNumber: "asc" },
  });

  const eligible = options?.skipTimeCheck
    ? pending
    : pending.filter((m) =>
        m.kickoffAt ? isReadyToPoll(m.kickoffAt, m.stage, now) : false
      );

  const results: SyncMatchResult[] = [];
  let importedAny = false;

  for (const match of eligible) {
    const result = await syncMatchResultFromApi(match.matchNumber, {
      skipTimeCheck: options?.skipTimeCheck,
      skipRecalc: true,
    });
    results.push(result);
    if (result.status === "imported") importedAny = true;
  }

  if (importedAny) {
    await afterOfficialResultsUpdate();
  }

  return results;
}
