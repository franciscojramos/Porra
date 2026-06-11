type TeamStanding = {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
};

type MatchResult = {
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeScore: number | null;
  awayScore: number | null;
};

export function computeGroupStandings(
  teamIds: string[],
  matches: MatchResult[]
) {
  const table = new Map<string, TeamStanding>();

  for (const teamId of teamIds) {
    table.set(teamId, {
      teamId,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      points: 0,
    });
  }

  for (const match of matches) {
    if (
      match.homeScore === null ||
      match.awayScore === null ||
      !match.homeTeamId ||
      !match.awayTeamId
    ) {
      continue;
    }

    const home = table.get(match.homeTeamId);
    const away = table.get(match.awayTeamId);
    if (!home || !away) continue;

    home.played++;
    away.played++;
    home.gf += match.homeScore;
    home.ga += match.awayScore;
    away.gf += match.awayScore;
    away.ga += match.homeScore;

    if (match.homeScore > match.awayScore) {
      home.won++;
      home.points += 3;
      away.lost++;
    } else if (match.homeScore < match.awayScore) {
      away.won++;
      away.points += 3;
      home.lost++;
    } else {
      home.drawn++;
      away.drawn++;
      home.points++;
      away.points++;
    }
  }

  const standings = Array.from(table.values()).map((row) => ({
    ...row,
    gd: row.gf - row.ga,
  }));

  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    return b.gf - a.gf;
  });

  return standings;
}
