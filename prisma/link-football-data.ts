/**
 * Regenera src/lib/footballData/matchIds.ts desde football-data.org.
 * Uso: FOOTBALL_DATA_TOKEN=... npm run db:link-football-data
 */
import { writeFileSync } from "fs";
import { join } from "path";
import { GROUP_MATCHES, KNOCKOUT_MATCHES } from "./world-cup-matches";
import { toFootballDataTla } from "../src/lib/teamCodes";

type ApiMatch = {
  id: number;
  utcDate: string;
  stage: string;
  homeTeam: { tla: string };
  awayTeam: { tla: string };
};

async function main() {
  const token = process.env.FOOTBALL_DATA_TOKEN;
  if (!token) throw new Error("FOOTBALL_DATA_TOKEN requerido");

  const res = await fetch("https://api.football-data.org/v4/competitions/WC/matches?season=2026", {
    headers: { "X-Auth-Token": token },
  });
  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { matches: ApiMatch[] };
  const apiMatches = data.matches ?? [];

  const mapping: Record<number, number> = {};
  const used = new Set<number>();

  for (const match of GROUP_MATCHES) {
    const homeApi = toFootballDataTla(match.home);
    const awayApi = toFootballDataTla(match.away);
    const found = apiMatches.find(
      (am) =>
        !used.has(am.id) &&
        am.homeTeam.tla === homeApi &&
        am.awayTeam.tla === awayApi
    );
    if (!found) {
      console.warn(`Sin mapeo grupo #${match.number} ${match.home}-${match.away}`);
      continue;
    }
    mapping[match.number] = found.id;
    used.add(found.id);
  }

  for (const match of KNOCKOUT_MATCHES) {
    const kickoff = new Date(match.kickoffAt);
    let best: ApiMatch | null = null;
    let bestDiff = Infinity;
    for (const am of apiMatches) {
      if (used.has(am.id) || am.stage === "GROUP_STAGE") continue;
      const diff = Math.abs(new Date(am.utcDate).getTime() - kickoff.getTime());
      if (diff < bestDiff) {
        bestDiff = diff;
        best = am;
      }
    }
    if (best && bestDiff < 4 * 3600000) {
      mapping[match.number] = best.id;
      used.add(best.id);
    } else {
      console.warn(`Sin mapeo KO #${match.number}`);
    }
  }

  const lines = Object.entries(mapping)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([n, id]) => `  ${n}: ${id},`)
    .join("\n");

  const content = `/** matchNumber → football-data.org match id (WC 2026). Generado por prisma/link-football-data.ts */\nexport const FOOTBALL_DATA_MATCH_IDS: Record<number, number> = {\n${lines}\n};\n\nexport function getFootballDataMatchId(matchNumber: number) {\n  return FOOTBALL_DATA_MATCH_IDS[matchNumber] ?? null;\n}\n`;

  const outPath = join(process.cwd(), "src/lib/footballData/matchIds.ts");
  writeFileSync(outPath, content);
  console.log(`Escrito ${outPath} (${Object.keys(mapping).length} partidos)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
