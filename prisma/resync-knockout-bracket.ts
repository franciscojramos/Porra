/**
 * Re-sincroniza equipos del cuadro KO en Turso según labels + clasificación oficial.
 * Uso: DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... npx tsx prisma/resync-knockout-bracket.ts
 */
import { createClient } from "@libsql/client";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { syncOfficialKnockoutBracket } from "../src/lib/officialKnockoutBracket";

async function main() {
  const url = process.env.DATABASE_URL!;
  const authToken = process.env.TURSO_AUTH_TOKEN || "";
  const adapter = new PrismaLibSql({ url, authToken });
  const prisma = new PrismaClient({ adapter });

  const result = await syncOfficialKnockoutBracket();
  console.log(`Cuadro re-resuelto: ${result.updated} partidos (${result.ready ? "listo" : "pendiente"})`);

  const client = createClient({ url, authToken });
  const r = await client.execute(`
    SELECT m.matchNumber, m.homeLabel, m.awayLabel,
           ht.name as home, at.name as away
    FROM Match m
    LEFT JOIN Team ht ON m.homeTeamId = ht.id
    LEFT JOIN Team at ON m.awayTeamId = at.id
    WHERE m.matchNumber BETWEEN 73 AND 88
    ORDER BY m.matchNumber
  `);
  for (const row of r.rows) {
    console.log(
      `#${row.matchNumber}`,
      `${row.homeLabel} vs ${row.awayLabel}`,
      "→",
      `${row.home} vs ${row.away}`
    );
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
