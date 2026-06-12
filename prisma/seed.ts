import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { GROUPS, GROUP_MATCHES, KNOCKOUT_MATCHES } from "./world-cup-matches";
import { SCORING_RULES } from "../src/lib/scoring-config";

const prisma = new PrismaClient();

async function upsertScoringRules() {
  for (const rule of SCORING_RULES) {
    await prisma.scoringConfig.upsert({
      where: { key: rule.key },
      create: { key: rule.key, points: rule.points, label: rule.label },
      update: { points: rule.points, label: rule.label },
    });
  }

  const validKeys = new Set(SCORING_RULES.map((r) => r.key));
  const existing = await prisma.scoringConfig.findMany();
  for (const row of existing) {
    if (!validKeys.has(row.key)) {
      await prisma.scoringConfig.delete({ where: { key: row.key } });
    }
  }
}

async function main() {
  await prisma.matchPrediction.deleteMany();
  await prisma.groupStandingPrediction.deleteMany();
  await prisma.bestThirdPrediction.deleteMany();
  await prisma.awardPrediction.deleteMany();
  await prisma.finalBracketPrediction.deleteMany();
  await prisma.officialGroupStanding.deleteMany();
  await prisma.officialBestThird.deleteMany();
  await prisma.officialAward.deleteMany();
  await prisma.officialFinalBracket.deleteMany();
  await prisma.match.deleteMany();
  await prisma.groupTeam.deleteMany();
  await prisma.group.deleteMany();
  await prisma.team.deleteMany();

  await upsertScoringRules();

  const teamIdByCode = new Map<string, string>();

  for (const teams of Object.values(GROUPS)) {
    for (const team of teams) {
      const created = await prisma.team.create({
        data: { name: team.name, code: team.code },
      });
      teamIdByCode.set(team.code, created.id);
    }
  }

  for (const [groupId, teams] of Object.entries(GROUPS)) {
    await prisma.group.create({
      data: { id: groupId, name: `Grupo ${groupId}` },
    });

    for (let index = 0; index < teams.length; index++) {
      const team = teams[index];
      await prisma.groupTeam.create({
        data: {
          groupId,
          teamId: teamIdByCode.get(team.code)!,
          position: index + 1,
        },
      });
    }
  }

  for (const match of GROUP_MATCHES) {
    await prisma.match.create({
      data: {
        matchNumber: match.number,
        stage: "GROUP",
        groupId: match.groupId,
        homeTeamId: teamIdByCode.get(match.home)!,
        awayTeamId: teamIdByCode.get(match.away)!,
        stadium: match.stadium,
        kickoffAt: new Date(match.kickoffAt),
      },
    });
  }

  for (const match of KNOCKOUT_MATCHES) {
    await prisma.match.create({
      data: {
        matchNumber: match.number,
        stage: match.stage,
        homeLabel: match.homeLabel,
        awayLabel: match.awayLabel,
        stadium: match.stadium,
        kickoffAt: new Date(match.kickoffAt),
      },
    });
  }

  const adminCount = await prisma.user.count({ where: { isAdmin: true } });
  if (adminCount === 0) {
    const adminUser = process.env.ADMIN_USERNAME || "admin";
    const adminPass = process.env.ADMIN_PASSWORD || "admin123";
    const authSecret = process.env.AUTH_SECRET;

    if (!authSecret) {
      throw new Error("AUTH_SECRET is required");
    }

    await prisma.user.create({
      data: {
        username: adminUser,
        password: await bcrypt.hash(adminPass, 10),
        displayName: "Administrador",
        isAdmin: true,
        score: { create: {} },
      },
    });

    console.log(`Admin creado: ${adminUser} / ${adminPass}`);
  }

  console.log("Seed completado: 48 equipos, 104 partidos oficiales.");
}

// Exportar para uso en API routes
export default main;

// Ejecutar si es script directo
if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
