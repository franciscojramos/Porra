#!/usr/bin/env tsx
/**
 * Script para exportar datos de dev.db a producción
 * 
 * Uso:
 * 1. Exportar desde local:
 *    DATABASE_URL="file:./dev.db" npx tsx prisma/export-data.ts > backup.json
 * 
 * 2. Importar en producción:
 *    DATABASE_URL="libsql://..." npx tsx prisma/import-data.ts backup.json
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";

const prisma = new PrismaClient();

async function exportData() {
  console.error("📦 Exportando datos...");

  const users = await prisma.user.findMany({
    include: {
      matchPredictions: true,
      standingPredictions: true,
      bestThirdPredictions: true,
      awardPredictions: true,
      finalBracket: true,
    },
  });

  const officialStandings = await prisma.officialGroupStanding.findMany();
  const officialBestThirds = await prisma.officialBestThird.findMany();
  const officialAwards = await prisma.officialAward.findMany();
  const officialFinalBracket = await prisma.officialFinalBracket.findMany();
  const matches = await prisma.match.findMany();

  const data = {
    users,
    officialStandings,
    officialBestThirds,
    officialAwards,
    officialFinalBracket,
    matches,
    exportedAt: new Date().toISOString(),
  };

  console.error(`✅ Exportados ${users.length} usuarios`);
  console.log(JSON.stringify(data, null, 2));
}

exportData()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
