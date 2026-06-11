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
import { syncFinalBracketFromKnockout } from "@/lib/knockoutBracket";
import { syncOfficialKnockoutBracket } from "@/lib/officialKnockoutBracket";
import { recalculateAllScores } from "@/lib/scoring";
import { isValidAwardPlayer } from "@/lib/players";
import { AwardCategory } from "@prisma/client";

function revalidateOfficialResults(matchNumber?: number) {
  revalidatePath("/inicio");
  revalidatePath("/grupos");
  revalidatePath("/eliminatorias");
  revalidatePath("/premios");
  revalidatePath("/clasificacion");
  revalidatePath("/reglas");
  revalidatePath("/perfil");
  revalidatePath("/jugadores");
  revalidatePath("/admin");
  revalidatePath("/admin/partidos");
  if (matchNumber) {
    revalidatePath(`/partidos/${matchNumber}`);
    revalidatePath(`/admin/partidos/${matchNumber}`);
  }
}

function revalidatePredictionPaths(userId?: string) {
  revalidatePath("/grupos");
  revalidatePath("/eliminatorias");
  revalidatePath("/premios");
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
  if (!user || user.phase1Locked) return;

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
  if (!user || user.phase2Locked) return;

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
  if (!user || user.phase1Locked) return;

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
  if (!user || user.phase2Locked) return;

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

  if (Number.isNaN(homeScore) || Number.isNaN(awayScore) || homeScore < 0 || awayScore < 0) {
    return;
  }

  await prisma.matchPrediction.upsert({
    where: { userId_matchId: { userId, matchId } },
    create: { userId, matchId, homeScore, awayScore },
    update: { homeScore, awayScore, points: 0 },
  });

  if (match.stage !== "GROUP") {
    await syncFinalBracketFromKnockout(userId);
  }

  revalidatePredictionPaths(userId);
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

  await syncFinalBracketFromKnockout(userId).catch(() => null);

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

  await syncFinalBracketFromKnockout(userId).catch(() => null);

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

  await prisma.match.update({
    where: { id: matchId },
    data: {
      homeScore,
      awayScore,
      scorersHome,
      scorersAway,
    },
  });

  const match = await prisma.match.findUnique({ where: { id: matchId } });

  await syncOfficialKnockoutBracket();

  await recalculateAllScores();
  revalidateOfficialResults(match?.matchNumber);
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

  await syncOfficialKnockoutBracket();
  await recalculateAllScores();
  revalidateOfficialResults();
}

export async function saveOfficialBestThirdAction(formData: FormData) {
  await requireAdmin();

  const teamIds = formData.getAll("teamId").map(String);
  await prisma.officialBestThird.deleteMany();
  await prisma.officialBestThird.createMany({
    data: teamIds.map((teamId) => ({ teamId })),
  });

  await syncOfficialKnockoutBracket();
  await recalculateAllScores();
  revalidateOfficialResults();
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

  await recalculateAllScores();
  revalidateOfficialResults();
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

  await recalculateAllScores();
  revalidateOfficialResults();
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

  await recalculateAllScores();
  revalidateOfficialResults();
}

export async function recalculateScoresAction() {
  await requireAdmin();
  await recalculateAllScores();
  revalidateOfficialResults();
}
