#!/usr/bin/env tsx
/**
 * Script para importar datos exportados a producción
 * 
 * Uso:
 * DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="..." npx tsx prisma/import-data.ts backup.json
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";

const prisma = new PrismaClient();

async function importData(filePath: string) {
  console.log("📥 Importando datos desde", filePath);

  const rawData = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(rawData);

  console.log(`Usuarios a importar: ${data.users.length}`);
  console.log(`Partidos con resultados: ${data.matches.filter((m: any) => m.homeScore !== null).length}`);

  // Primero, verificar que equipos y partidos ya existen (seed debe haberse ejecutado)
  const teamCount = await prisma.team.count();
  const matchCount = await prisma.match.count();

  if (teamCount === 0 || matchCount === 0) {
    throw new Error("❌ Debes ejecutar el seed primero (teams y matches)");
  }

  console.log(`✅ BD tiene ${teamCount} equipos y ${matchCount} partidos`);

  // Mapear IDs de partidos (local → producción)
  const matchMapping = new Map<string, string>();
  const localMatches = data.matches;
  const prodMatches = await prisma.match.findMany();

  for (const localMatch of localMatches) {
    const prodMatch = prodMatches.find((m) => m.matchNumber === localMatch.matchNumber);
    if (prodMatch) {
      matchMapping.set(localMatch.id, prodMatch.id);
    }
  }

  console.log(`Mapeados ${matchMapping.size} partidos`);

  // Importar usuarios y sus pronósticos
  for (const user of data.users) {
    const { matchPredictions, standingPredictions, bestThirdPredictions, awardPredictions, finalBracket, score, ...userData } = user;

    // Crear o actualizar usuario
    const createdUser = await prisma.user.upsert({
      where: { username: userData.username },
      update: {
        displayName: userData.displayName,
        password: userData.password,
        isAdmin: userData.isAdmin,
        phase1Locked: userData.phase1Locked,
        phase1LockedAt: userData.phase1LockedAt,
        phase2Locked: userData.phase2Locked,
        phase2LockedAt: userData.phase2LockedAt,
      },
      create: userData,
    });

    console.log(`  ✓ Usuario: ${createdUser.displayName}`);

    // Importar pronósticos de partidos
    for (const pred of matchPredictions) {
      const prodMatchId = matchMapping.get(pred.matchId);
      if (!prodMatchId) continue;

      await prisma.matchPrediction.upsert({
        where: {
          userId_matchId: {
            userId: createdUser.id,
            matchId: prodMatchId,
          },
        },
        update: {
          homeScore: pred.homeScore,
          awayScore: pred.awayScore,
          advancesTeamId: pred.advancesTeamId,
          points: pred.points,
        },
        create: {
          userId: createdUser.id,
          matchId: prodMatchId,
          homeScore: pred.homeScore,
          awayScore: pred.awayScore,
          advancesTeamId: pred.advancesTeamId,
          points: pred.points,
        },
      });
    }

    // Importar clasificaciones de grupos
    for (const pred of standingPredictions) {
      await prisma.groupStandingPrediction.upsert({
        where: {
          userId_groupId: {
            userId: createdUser.id,
            groupId: pred.groupId,
          },
        },
        update: {
          firstTeamId: pred.firstTeamId,
          secondTeamId: pred.secondTeamId,
          thirdTeamId: pred.thirdTeamId,
          fourthTeamId: pred.fourthTeamId,
          points: pred.points,
        },
        create: {
          userId: createdUser.id,
          groupId: pred.groupId,
          firstTeamId: pred.firstTeamId,
          secondTeamId: pred.secondTeamId,
          thirdTeamId: pred.thirdTeamId,
          fourthTeamId: pred.fourthTeamId,
          points: pred.points,
        },
      });
    }

    // Importar mejores terceros
    for (const pred of bestThirdPredictions) {
      await prisma.bestThirdPrediction.upsert({
        where: {
          userId_teamId: {
            userId: createdUser.id,
            teamId: pred.teamId,
          },
        },
        update: {
          points: pred.points,
        },
        create: {
          userId: createdUser.id,
          teamId: pred.teamId,
          points: pred.points,
        },
      });
    }

    // Importar premios
    for (const pred of awardPredictions) {
      await prisma.awardPrediction.upsert({
        where: {
          userId_category: {
            userId: createdUser.id,
            category: pred.category,
          },
        },
        update: {
          playerId: pred.playerId,
          points: pred.points,
        },
        create: {
          userId: createdUser.id,
          category: pred.category,
          playerId: pred.playerId,
          points: pred.points,
        },
      });
    }

    // Importar cuadro final
    if (finalBracket) {
      await prisma.finalBracketPrediction.upsert({
        where: { userId: createdUser.id },
        update: {
          championTeamId: finalBracket.championTeamId,
          runnerUpTeamId: finalBracket.runnerUpTeamId,
          thirdPlaceTeamId: finalBracket.thirdPlaceTeamId,
          fourthPlaceTeamId: finalBracket.fourthPlaceTeamId,
          points: finalBracket.points,
        },
        create: {
          userId: createdUser.id,
          championTeamId: finalBracket.championTeamId,
          runnerUpTeamId: finalBracket.runnerUpTeamId,
          thirdPlaceTeamId: finalBracket.thirdPlaceTeamId,
          fourthPlaceTeamId: finalBracket.fourthPlaceTeamId,
          points: finalBracket.points,
        },
      });
    }
  }

  // Importar resultados oficiales
  console.log("\n📊 Importando resultados oficiales...");

  for (const standing of data.officialStandings) {
    await prisma.officialGroupStanding.upsert({
      where: { groupId: standing.groupId },
      update: standing,
      create: standing,
    });
  }

  for (const third of data.officialBestThirds) {
    await prisma.officialBestThird.upsert({
      where: { teamId: third.teamId },
      update: third,
      create: third,
    });
  }

  for (const award of data.officialAwards) {
    await prisma.officialAward.upsert({
      where: { category: award.category },
      update: award,
      create: award,
    });
  }

  if (data.officialFinalBracket.length > 0) {
    const bracket = data.officialFinalBracket[0];
    await prisma.officialFinalBracket.upsert({
      where: { id: bracket.id },
      update: bracket,
      create: bracket,
    });
  }

  // Actualizar resultados de partidos
  console.log("\n⚽ Actualizando resultados de partidos...");
  for (const match of data.matches) {
    if (match.homeScore === null) continue;

    const prodMatchId = matchMapping.get(match.id);
    if (!prodMatchId) continue;

    await prisma.match.update({
      where: { id: prodMatchId },
      data: {
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        winnerTeamId: match.winnerTeamId,
        scorersHome: match.scorersHome,
        scorersAway: match.scorersAway,
        status: match.status,
      },
    });
  }

  console.log("\n✅ Importación completada");
  console.log(`Usuarios: ${data.users.length}`);
  console.log(`Resultados oficiales importados`);
}

const filePath = process.argv[2];
if (!filePath) {
  console.error("❌ Uso: npx tsx prisma/import-data.ts backup.json");
  process.exit(1);
}

importData(filePath)
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
