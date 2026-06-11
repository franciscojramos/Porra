import { PrismaClient } from "@prisma/client";
import { SCORING_RULES } from "../src/lib/scoring-config";

const prisma = new PrismaClient();

async function main() {
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

  console.log(`Reglas de puntuación sincronizadas: ${SCORING_RULES.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
