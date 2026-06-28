"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  authenticate,
  createSession,
  destroySession,
  hashPassword,
  requireAdmin,
  requireSession,
} from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canEditPhase1Predictions, canEditPhase2Predictions } from "@/lib/predictions";
import { canEditKnockoutMatchStage } from "@/lib/knockoutRoundUnlock";
import { MatchStage } from "@prisma/client";
import { afterOfficialResultsUpdate, revalidateOfficialResults, scheduleAfterOfficialResultsUpdate } from "@/lib/afterOfficialUpdate";
import { syncPendingMatchResults } from "@/lib/footballData/syncResults";
import { isValidAwardPlayer } from "@/lib/players";
import { AwardCategory } from "@prisma/client";

function revalidatePredictionPaths(userId?: string) {
  revalidatePath("/grupos");
  revalidatePath("/eliminatorias");
  revalidatePath("/premios");
  revalidatePath("/mis-pronosticos");
  revalidatePath("/perfil");
  revalidatePath("/jugadores");
  revalidatePath("/inicio");
  if (userId) {
    revalidatePath(`/jugadores/${userId}`);
    revalidatePath(`/admin/usuarios/${userId}`);
  }
  revalidatePath("/admin");
}


export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");

  if (!username || !password) {
    return { error: "Usuario y contraseña obligatorios" };
  }

  const user = await authenticate(username, password);
  if (!user) {
    return { error: "Credenciales incorrectas" };
  }

  await createSession(user);
  redirect("/inicio");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

export async function createUserAction(formData: FormData) {
  await requireAdmin();

  const username = String(formData.get("username") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const displayName = String(formData.get("displayName") || "").trim();

  if (!username || !password || !displayName) {
    return;
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return;
  }

  await prisma.user.create({
    data: {
      username,
      password: await hashPassword(password),
      displayName,
      score: { create: {} },
    },
  });

  revalidatePath("/admin");
  revalidatePath("/jugadores");
}

export async function confirmPhase1Action(formData: FormData) {
  const session = await requireSession();
  const confirmed = formData.get("confirmed") === "on";

  if (!confirmed) return;

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user || user.isAdmin || user.phase1Locked) return;

  await prisma.user.update({
    where: { id: session.id },
    data: {
      phase1Locked: true,
      phase1LockedAt: new Date(),
    },
  });

  revalidatePredictionPaths(session.id);
  redirect("/perfil");
}

/** @deprecated alias */
export async function confirmPredictionsAction(formData: FormData) {
  return confirmPhase1Action(formData);
}

export async function confirmPhase2Action(formData: FormData) {
  const session = await requireSession();
  const confirmed = formData.get("confirmed") === "on";

  if (!confirmed) return;

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user || user.isAdmin || user.phase2Locked) return;

  const allowed = await canEditPhase2Predictions(session.id, session.id, session.isAdmin);
  if (!allowed) return;

  await prisma.user.update({
    where: { id: session.id },
    data: {
      phase2Locked: true,
      phase2LockedAt: new Date(),
    },
  });

  revalidatePredictionPaths(session.id);
  redirect("/perfil");
}

export async function unlockUserPhase1Action(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId"));
  await prisma.user.update({
    where: { id: userId },
    data: {
      phase1Locked: false,
      phase1LockedAt: null,
    },
  });

  revalidatePredictionPaths(userId);
}

export async function unlockUserPhase2Action(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId"));
  await prisma.user.update({
    where: { id: userId },
    data: {
      phase2Locked: false,
      phase2LockedAt: null,
    },
  });

  revalidatePredictionPaths(userId);
}

/** Desbloquea fase 1 y 2 */
export async function unlockUserPredictionsAction(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId"));
  await prisma.user.update({
    where: { id: userId },
    data: {
      phase1Locked: false,
      phase1LockedAt: null,
      phase2Locked: false,
      phase2LockedAt: null,
    },
  });

  revalidatePredictionPaths(userId);
}

export async function completeUserPhase1Action(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId"));
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.isAdmin || user.phase1Locked) return;

  await prisma.user.update({
    where: { id: userId },
    data: {
      phase1Locked: true,
      phase1LockedAt: new Date(),
    },
  });

  revalidatePredictionPaths(userId);
}

export async function completeUserPhase2Action(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId"));
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.isAdmin || user.phase2Locked) return;

  await prisma.user.update({
    where: { id: userId },
    data: {
      phase2Locked: true,
      phase2LockedAt: new Date(),
    },
  });

  revalidatePredictionPaths(userId);
}

/** @deprecated alias */
export async function completeUserPredictionsAction(formData: FormData) {
  return completeUserPhase1Action(formData);
}

async function assertCanSavePhase1Prediction(formData: FormData) {
  const session = await requireSession();
  const targetUserId = String(formData.get("userId") || "");
  const adminPanel = session.isAdmin && !!targetUserId;
  const userId = adminPanel ? targetUserId : session.id;

  const allowed = await canEditPhase1Predictions(userId, session.id, session.isAdmin, {
    adminPanel,
  });

  return { allowed, userId, adminPanel };
}

async function assertCanSavePhase2Prediction(formData: FormData) {
  const session = await requireSession();
  const targetUserId = String(formData.get("userId") || "");
  const adminPanel = session.isAdmin && !!targetUserId;
  const userId = adminPanel ? targetUserId : session.id;

  const allowed = await canEditPhase2Predictions(userId, session.id, session.isAdmin, {
    adminPanel,
  });

  return { allowed, userId, adminPanel };
}

export async function saveMatchPredictionAction(formData: FormData) {
  const matchId = String(formData.get("matchId"));
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return;

  const ctx =
    match.stage === "GROUP"
      ? await assertCanSavePhase1Prediction(formData)
      : await assertCanSavePhase2Prediction(formData);

  if (!ctx.allowed) return;
  const { userId } = ctx;

  const homeScore = Number(formData.get("homeScore"));
  const awayScore = Number(formData.get("awayScore"));
  const advancesRaw = String(formData.get("advancesTeamId") || "").trim();
  const advancesTeamId = advancesRaw || null;

  if (Number.isNaN(homeScore) || Number.isNaN(awayScore) || homeScore < 0 || awayScore < 0) {
    return;
  }

  if (match.stage !== "GROUP") {
    if (!ctx.adminPanel) {
      const stageAllowed = await canEditKnockoutMatchStage(match.stage);
      if (!stageAllowed) return;
    }

    const { homeTeamId, awayTeamId } = match;
    if (homeScore === awayScore && homeTeamId && awayTeamId) {
      if (!advancesTeamId || ![homeTeamId, awayTeamId].includes(advancesTeamId)) {
        return;
      }
    }
  }

  await prisma.matchPrediction.upsert({
    where: { userId_matchId: { userId, matchId } },
    create: { userId, matchId, homeScore, awayScore, advancesTeamId },
    update: { homeScore, awayScore, advancesTeamId, points: 0 },
  });

  revalidatePredictionPaths(userId);
}

type KnockoutPredictionPayload = {
  homeScore: number;
  awayScore: number;
  advancesTeamId: string | null;
};

/** Guarda todos los pronósticos de eliminatorias editables de una vez. */
export async function saveAllKnockoutPredictionsAction(formData: FormData) {
  const ctx = await assertCanSavePhase2Prediction(formData);
  if (!ctx.allowed) {
    return { ok: false as const, error: "No puedes guardar pronósticos ahora." };
  }

  let predictions: Record<string, KnockoutPredictionPayload>;
  try {
    predictions = JSON.parse(String(formData.get("predictions") || "{}"));
  } catch {
    return { ok: false as const, error: "Datos inválidos." };
  }

  const matches = await prisma.match.findMany({
    where: { stage: { not: MatchStage.GROUP } },
    orderBy: { matchNumber: "asc" },
  });

  const toSave: {
    matchId: string;
    homeScore: number;
    awayScore: number;
    advancesTeamId: string | null;
  }[] = [];

  for (const match of matches) {
    const pred = predictions[match.id];
    if (!pred) continue;

    if (!ctx.adminPanel) {
      const stageAllowed = await canEditKnockoutMatchStage(match.stage);
      if (!stageAllowed) continue;
    }

    const homeScore = Number(pred.homeScore);
    const awayScore = Number(pred.awayScore);
    const advancesTeamId = pred.advancesTeamId || null;

    if (Number.isNaN(homeScore) || Number.isNaN(awayScore) || homeScore < 0 || awayScore < 0) {
      return {
        ok: false as const,
        error: `Marcador inválido en el partido #${match.matchNumber}.`,
      };
    }

    const { homeTeamId, awayTeamId } = match;
    if (homeScore === awayScore && homeTeamId && awayTeamId) {
      if (!advancesTeamId || ![homeTeamId, awayTeamId].includes(advancesTeamId)) {
        return {
          ok: false as const,
          error: `Elige quién pasa en el partido #${match.matchNumber} (empate).`,
        };
      }
    }

    toSave.push({ matchId: match.id, homeScore, awayScore, advancesTeamId });
  }

  for (const item of toSave) {
    await prisma.matchPrediction.upsert({
      where: { userId_matchId: { userId: ctx.userId, matchId: item.matchId } },
      create: {
        userId: ctx.userId,
        matchId: item.matchId,
        homeScore: item.homeScore,
        awayScore: item.awayScore,
        advancesTeamId: item.advancesTeamId,
        points: 0,
      },
      update: {
        homeScore: item.homeScore,
        awayScore: item.awayScore,
        advancesTeamId: item.advancesTeamId,
        points: 0,
      },
    });
  }

  revalidatePredictionPaths(ctx.userId);
  return { ok: true as const };
}

export async function saveStandingPredictionAction(formData: FormData) {
  const { allowed, userId } = await assertCanSavePhase1Prediction(formData);
  if (!allowed) return;

  const groupId = String(formData.get("groupId"));
  const firstTeamId = String(formData.get("firstTeamId"));
  const secondTeamId = String(formData.get("secondTeamId"));
  const thirdTeamId = String(formData.get("thirdTeamId"));
  const fourthTeamId = String(formData.get("fourthTeamId"));

  const ids = [firstTeamId, secondTeamId, thirdTeamId, fourthTeamId];
  if (new Set(ids).size !== 4) {
    return;
  }

  await prisma.groupStandingPrediction.upsert({
    where: { userId_groupId: { userId, groupId } },
    create: {
      userId,
      groupId,
      firstTeamId,
      secondTeamId,
      thirdTeamId,
      fourthTeamId,
    },
    update: { firstTeamId, secondTeamId, thirdTeamId, fourthTeamId, points: 0 },
  });

  revalidatePredictionPaths(userId);
}

export async function saveBestThirdAction(formData: FormData) {
  const { allowed, userId } = await assertCanSavePhase1Prediction(formData);
  if (!allowed) return;

  const teamIds = formData.getAll("teamId").map(String);

  if (teamIds.length !== 8) {
    return;
  }

  const standings = await prisma.groupStandingPrediction.findMany({
    where: { userId },
    select: { thirdTeamId: true },
  });
  const allowedThirdIds = new Set(standings.map((s) => s.thirdTeamId));

  if (teamIds.some((teamId) => !allowedThirdIds.has(teamId))) {
    return;
  }

  if (new Set(teamIds).size !== 8) {
    return;
  }

  await prisma.bestThirdPrediction.deleteMany({ where: { userId } });
  await prisma.bestThirdPrediction.createMany({
    data: teamIds.map((teamId) => ({ userId, teamId })),
  });

  revalidatePredictionPaths(userId);
}

export async function saveAwardPredictionAction(formData: FormData) {
  const { allowed, userId } = await assertCanSavePhase1Prediction(formData);
  if (!allowed) return;

  const category = String(formData.get("category")) as AwardCategory;
  const first = String(formData.get("first") || "").trim() || null;
  const second = String(formData.get("second") || "").trim() || null;
  const third = String(formData.get("third") || "").trim() || null;

  if (
    !isValidAwardPlayer(category, first) ||
    !isValidAwardPlayer(category, second) ||
    !isValidAwardPlayer(category, third)
  ) {
    return;
  }

  await prisma.awardPrediction.upsert({
    where: { userId_category: { userId, category } },
    create: { userId, category, first, second, third },
    update: { first, second, third, points: 0 },
  });

  revalidatePredictionPaths(userId);
}

function parseScoreField(formData: FormData, matchId: string) {
  const homeRaw = formData.get(`score_${matchId}_home`);
  const awayRaw = formData.get(`score_${matchId}_away`);
  if (homeRaw === null || awayRaw === null || homeRaw === "" || awayRaw === "") {
    return null;
  }
  const homeScore = Number(homeRaw);
  const awayScore = Number(awayRaw);
  if (Number.isNaN(homeScore) || Number.isNaN(awayScore) || homeScore < 0 || awayScore < 0) {
    return null;
  }
  return { homeScore, awayScore };
}

async function upsertGroupMatchPredictions(
  userId: string,
  groupId: string,
  formData: FormData
) {
  const matches = await prisma.match.findMany({
    where: { groupId, stage: "GROUP" },
  });

  for (const match of matches) {
    const scores = parseScoreField(formData, match.id);
    if (!scores) continue;

    await prisma.matchPrediction.upsert({
      where: { userId_matchId: { userId, matchId: match.id } },
      create: { userId, matchId: match.id, ...scores, points: 0 },
      update: { ...scores, points: 0 },
    });
  }
}

async function upsertGroupStandingFromForm(
  userId: string,
  groupId: string,
  formData: FormData
) {
  const firstTeamId = String(formData.get(`standing_${groupId}_firstTeamId`) || "");
  const secondTeamId = String(formData.get(`standing_${groupId}_secondTeamId`) || "");
  const thirdTeamId = String(formData.get(`standing_${groupId}_thirdTeamId`) || "");
  const fourthTeamId = String(formData.get(`standing_${groupId}_fourthTeamId`) || "");

  if (!firstTeamId || !secondTeamId || !thirdTeamId || !fourthTeamId) {
    return false;
  }

  const ids = [firstTeamId, secondTeamId, thirdTeamId, fourthTeamId];
  if (new Set(ids).size !== 4) {
    return false;
  }

  await prisma.groupStandingPrediction.upsert({
    where: { userId_groupId: { userId, groupId } },
    create: {
      userId,
      groupId,
      firstTeamId,
      secondTeamId,
      thirdTeamId,
      fourthTeamId,
    },
    update: { firstTeamId, secondTeamId, thirdTeamId, fourthTeamId, points: 0 },
  });

  return true;
}

async function upsertBestThirdsFromForm(userId: string, formData: FormData) {
  const teamIds = formData.getAll("teamId").map(String);
  if (teamIds.length !== 8) return false;

  const standings = await prisma.groupStandingPrediction.findMany({
    where: { userId },
    select: { thirdTeamId: true },
  });
  const allowedThirdIds = new Set(standings.map((s) => s.thirdTeamId));

  if (teamIds.some((teamId) => !allowedThirdIds.has(teamId))) return false;
  if (new Set(teamIds).size !== 8) return false;

  await prisma.bestThirdPrediction.deleteMany({ where: { userId } });
  await prisma.bestThirdPrediction.createMany({
    data: teamIds.map((teamId) => ({ userId, teamId })),
  });

  return true;
}

/** Guarda partidos + clasificación de un solo grupo */
export async function saveGroupPhase1Action(formData: FormData) {
  const { allowed, userId } = await assertCanSavePhase1Prediction(formData);
  if (!allowed) return;

  const groupId = String(formData.get("groupId") || "");
  if (!groupId) return;

  await upsertGroupMatchPredictions(userId, groupId, formData);
  await upsertGroupStandingFromForm(userId, groupId, formData);
  revalidatePredictionPaths(userId);
}

/** Guarda todos los grupos + 8 mejores terceros */
export async function saveAllGruposPhase1Action(formData: FormData) {
  const { allowed, userId } = await assertCanSavePhase1Prediction(formData);
  if (!allowed) return;

  const groups = await prisma.group.findMany({ select: { id: true } });

  for (const { id: groupId } of groups) {
    await upsertGroupMatchPredictions(userId, groupId, formData);
    await upsertGroupStandingFromForm(userId, groupId, formData);
  }

  await upsertBestThirdsFromForm(userId, formData);
  revalidatePredictionPaths(userId);
}

const AWARD_CATEGORIES: AwardCategory[] = [
  "GOLDEN_BALL",
  "GOLDEN_BOOT",
  "GOLDEN_GLOVE",
  "BEST_YOUNG",
];

async function upsertAwardFromForm(
  userId: string,
  category: AwardCategory,
  formData: FormData
) {
  const first = String(formData.get(`${category}_first`) || "").trim() || null;
  const second = String(formData.get(`${category}_second`) || "").trim() || null;
  const third = String(formData.get(`${category}_third`) || "").trim() || null;

  if (
    !isValidAwardPlayer(category, first) ||
    !isValidAwardPlayer(category, second) ||
    !isValidAwardPlayer(category, third)
  ) {
    return false;
  }

  await prisma.awardPrediction.upsert({
    where: { userId_category: { userId, category } },
    create: { userId, category, first, second, third },
    update: { first, second, third, points: 0 },
  });

  return true;
}

/** Guarda los 4 premios individuales de una vez */
export async function saveAllAwardsAction(formData: FormData) {
  const { allowed, userId } = await assertCanSavePhase1Prediction(formData);
  if (!allowed) return;

  for (const category of AWARD_CATEGORIES) {
    await upsertAwardFromForm(userId, category, formData);
  }

  revalidatePredictionPaths(userId);
}

export async function saveOfficialMatchAction(formData: FormData) {
  await requireAdmin();

  const matchId = String(formData.get("matchId"));
  const homeScore = Number(formData.get("homeScore"));
  const awayScore = Number(formData.get("awayScore"));

  const scorerHomeList = formData.getAll("scorerHome").map(String).filter(Boolean);
  const scorerAwayList = formData.getAll("scorerAway").map(String).filter(Boolean);

  const scorersHome =
    scorerHomeList.length > 0
      ? scorerHomeList.join(", ")
      : String(formData.get("scorersHome") || "").trim() || null;
  const scorersAway =
    scorerAwayList.length > 0
      ? scorerAwayList.join(", ")
      : String(formData.get("scorersAway") || "").trim() || null;

  const ownGoalsHome = String(formData.get("ownGoalsHome") || "").trim() || null;
  const ownGoalsAway = String(formData.get("ownGoalsAway") || "").trim() || null;

  const matchBefore = await prisma.match.findUnique({ where: { id: matchId } });
  const winnerRaw = String(formData.get("winnerTeamId") || "").trim();
  let winnerTeamId: string | null = winnerRaw || null;

  if (matchBefore && matchBefore.stage !== "GROUP") {
    if (homeScore !== awayScore) {
      winnerTeamId = null;
    } else if (matchBefore.homeTeamId && matchBefore.awayTeamId) {
      if (!winnerTeamId || ![matchBefore.homeTeamId, matchBefore.awayTeamId].includes(winnerTeamId)) {
        return;
      }
    } else {
      winnerTeamId = null;
    }
  } else {
    winnerTeamId = null;
  }

  await prisma.match.update({
    where: { id: matchId },
    data: {
      homeScore,
      awayScore,
      scorersHome,
      scorersAway,
      ownGoalsHome,
      ownGoalsAway,
      winnerTeamId,
      scoreManuallyEdited: true,
    },
  });

  const match = await prisma.match.findUnique({ where: { id: matchId } });

  revalidateOfficialResults(match?.matchNumber);
  scheduleAfterOfficialResultsUpdate(match?.matchNumber);

  const msg = encodeURIComponent("Partido guardado correctamente");
  const redirectUrl = String(formData.get("redirectUrl") || "").trim();
  if (redirectUrl && match) {
    redirect(`${redirectUrl}?msg=${msg}`);
  } else if (match) {
    redirect(`/admin/partidos/${match.matchNumber}?msg=${msg}`);
  }
}

export async function saveOfficialStandingAction(formData: FormData) {
  await requireAdmin();

  const groupId = String(formData.get("groupId"));
  await prisma.officialGroupStanding.upsert({
    where: { groupId },
    create: {
      groupId,
      firstTeamId: String(formData.get("firstTeamId")),
      secondTeamId: String(formData.get("secondTeamId")),
      thirdTeamId: String(formData.get("thirdTeamId")),
      fourthTeamId: String(formData.get("fourthTeamId")),
    },
    update: {
      firstTeamId: String(formData.get("firstTeamId")),
      secondTeamId: String(formData.get("secondTeamId")),
      thirdTeamId: String(formData.get("thirdTeamId")),
      fourthTeamId: String(formData.get("fourthTeamId")),
    },
  });

  await afterOfficialResultsUpdate();
}

export async function saveOfficialBestThirdAction(formData: FormData) {
  await requireAdmin();

  const teamIds = formData.getAll("teamId").map(String);
  await prisma.officialBestThird.deleteMany();
  await prisma.officialBestThird.createMany({
    data: teamIds.map((teamId) => ({ teamId })),
  });

  await afterOfficialResultsUpdate();
}

export async function saveOfficialAwardAction(formData: FormData) {
  await requireAdmin();

  const category = String(formData.get("category")) as AwardCategory;
  const first = String(formData.get("first") || "").trim() || null;
  const second = String(formData.get("second") || "").trim() || null;
  const third = String(formData.get("third") || "").trim() || null;

  if (
    !isValidAwardPlayer(category, first) ||
    !isValidAwardPlayer(category, second) ||
    !isValidAwardPlayer(category, third)
  ) {
    return;
  }

  await prisma.officialAward.upsert({
    where: { category },
    create: {
      category,
      first,
      second,
      third,
    },
    update: {
      first,
      second,
      third,
    },
  });

  await afterOfficialResultsUpdate();
}

export async function saveUserFinalBracketAction(formData: FormData) {
  const session = await requireSession();
  const targetUserId = String(formData.get("userId") || "").trim();
  const adminPanel = session.isAdmin && !!targetUserId;
  const userId = adminPanel ? targetUserId : session.id;

  if (!adminPanel) {
    if (session.isAdmin) return;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { finalBracketLocked: true },
    });
    if (!user || user.finalBracketLocked) return;
    const r32Open = await canEditKnockoutMatchStage(MatchStage.ROUND_32);
    if (!r32Open) return;
    if (formData.get("confirmed") !== "on") return;
  }

  const championTeamId = String(formData.get("championTeamId") || "").trim();
  const runnerUpTeamId = String(formData.get("runnerUpTeamId") || "").trim();
  const thirdPlaceTeamId = String(formData.get("thirdPlaceTeamId") || "").trim();
  const fourthPlaceTeamId = String(formData.get("fourthPlaceTeamId") || "").trim();

  const ids = [championTeamId, runnerUpTeamId, thirdPlaceTeamId, fourthPlaceTeamId];
  if (ids.some((id) => !id) || new Set(ids).size !== 4) {
    return;
  }

  await prisma.finalBracketPrediction.upsert({
    where: { userId },
    create: {
      userId,
      championTeamId,
      runnerUpTeamId,
      thirdPlaceTeamId,
      fourthPlaceTeamId,
      points: 0,
    },
    update: {
      championTeamId,
      runnerUpTeamId,
      thirdPlaceTeamId,
      fourthPlaceTeamId,
      points: 0,
    },
  });

  if (!adminPanel) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        finalBracketLocked: true,
        finalBracketLockedAt: new Date(),
      },
    });
  }

  revalidatePredictionPaths(userId);
}

export async function saveOfficialFinalBracketAction(formData: FormData) {
  await requireAdmin();

  const championTeamId = String(formData.get("championTeamId") || "").trim() || null;
  const runnerUpTeamId = String(formData.get("runnerUpTeamId") || "").trim() || null;
  const thirdPlaceTeamId = String(formData.get("thirdPlaceTeamId") || "").trim() || null;
  const fourthPlaceTeamId = String(formData.get("fourthPlaceTeamId") || "").trim() || null;

  await prisma.officialFinalBracket.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      championTeamId,
      runnerUpTeamId,
      thirdPlaceTeamId,
      fourthPlaceTeamId,
    },
    update: {
      championTeamId,
      runnerUpTeamId,
      thirdPlaceTeamId,
      fourthPlaceTeamId,
    },
  });

  await afterOfficialResultsUpdate();
}

export async function updateScoringAction(formData: FormData) {
  await requireAdmin();

  const keys = formData.getAll("key").map(String);
  for (const key of keys) {
    const points = Number(formData.get(`points_${key}`));
    if (!Number.isNaN(points)) {
      await prisma.scoringConfig.update({
        where: { key },
        data: { points },
      });
    }
  }

  await afterOfficialResultsUpdate();
}

export async function recalculateScoresAction() {
  await requireAdmin();
  await afterOfficialResultsUpdate();
}

export async function importPendingResultsAction() {
  await requireAdmin();

  try {
    const results = await syncPendingMatchResults({ skipTimeCheck: true });
    const errorResults = results.filter((r) => r.status === "error");
    return {
      imported: results.filter((r) => r.status === "imported").length,
      pending: results.filter((r) => r.status === "pending").length,
      skipped: results.filter((r) => r.status === "skipped").length,
      errors: errorResults.length,
      errorSamples: errorResults.slice(0, 3).map((r) => `#${r.matchNumber}: ${r.error}`),
      error: null as string | null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al importar resultados";
    return {
      imported: 0,
      pending: 0,
      skipped: 0,
      errors: 0,
      errorSamples: [] as string[],
      error: message,
    };
  }
}

export async function changeUserPasswordAction(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId"));
  const newPassword = String(formData.get("newPassword")).trim();

  if (!newPassword || newPassword.length < 3) {
    throw new Error("La contraseña debe tener al menos 3 caracteres");
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  revalidatePredictionPaths(userId);
}
