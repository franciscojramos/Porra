import type { FootballDataMatch } from "./types";

const BASE_URL = "https://api.football-data.org/v4";

function getToken() {
  const token = process.env.FOOTBALL_DATA_TOKEN?.trim();
  if (!token) {
    throw new Error("FOOTBALL_DATA_TOKEN no configurado");
  }
  return token;
}

export async function fetchFootballDataMatch(matchId: number): Promise<FootballDataMatch | null> {
  const res = await fetch(`${BASE_URL}/matches/${matchId}`, {
    headers: { "X-Auth-Token": getToken() },
    cache: "no-store",
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`football-data.org ${res.status}: ${await res.text()}`);
  }

  return res.json() as Promise<FootballDataMatch>;
}

/** Una sola petición: todos los partidos del Mundial (evita rate limit 10/min). */
export async function fetchWorldCupMatches(season = 2026): Promise<FootballDataMatch[]> {
  const res = await fetch(`${BASE_URL}/competitions/WC/matches?season=${season}`, {
    headers: { "X-Auth-Token": getToken() },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`football-data.org ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as { matches: FootballDataMatch[] };
  return data.matches ?? [];
}

export function indexMatchesById(matches: FootballDataMatch[]) {
  return new Map(matches.map((m) => [m.id, m]));
}
