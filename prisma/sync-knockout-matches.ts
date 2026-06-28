/**
 * Actualiza labels y horarios de eliminatorias desde KNOCKOUT_MATCHES sin borrar datos.
 * Uso: npm run db:sync-knockout
 */
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { KNOCKOUT_MATCHES } from "./world-cup-matches";
import { syncOfficialKnockoutBracket } from "../src/lib/officialKnockoutBracket";

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL || "";
  if (databaseUrl.startsWith("libsql://")) {
    const adapter = new PrismaLibSql({
      url: databaseUrl,
      authToken: process.env.TURSO_AUTH_TOKEN || "",
    });
    return new PrismaClient({ adapter });
  }
  return new PrismaClient();
}

const prisma = createPrismaClient();

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
