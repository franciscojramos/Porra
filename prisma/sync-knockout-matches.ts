/**
 * Actualiza labels y horarios de eliminatorias desde KNOCKOUT_MATCHES sin borrar datos.
 * Uso: npm run db:sync-knockout
 */
import { PrismaClient } from "@prisma/client";
import { KNOCKOUT_MATCHES } from "./world-cup-matches";
import { syncOfficialKnockoutBracket } from "../src/lib/officialKnockoutBracket";

const prisma = new PrismaClient();

async function main() {
  let updated = 0;

  for (const seed of KNOCKOUT_MATCHES) {
    const result = await prisma.match.updateMany({
      where: { matchNumber: seed.number },
      data: {
        homeLabel: seed.homeLabel,
        awayLabel: seed.awayLabel,
        stadium: seed.stadium,
        kickoffAt: new Date(seed.kickoffAt),
      },
    });
    updated += result.count;
  }

  const bracket = await syncOfficialKnockoutBracket();
  console.log(`Eliminatorias sincronizadas: ${updated} partidos`);
  console.log(`Cuadro oficial re-resuelto: ${bracket.updated} equipos (${bracket.ready ? "listo" : "pendiente clasificación"})`);
}

if (require.main === module) {
  main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}

export default main;
