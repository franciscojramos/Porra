export type FootballDataTeam = {
  id: number;
  name: string;
  shortName: string;
  tla: string;
};

export type FootballDataScorePart = {
  home: number | null;
  away: number | null;
};

export type FootballDataScore = {
  winner?: "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null;
  duration?: "REGULAR" | "EXTRA_TIME" | "PENALTY_SHOOTOUT" | string;
  fullTime?: FootballDataScorePart | null;
  halfTime?: FootballDataScorePart | null;
  regularTime?: FootballDataScorePart | null;
  extraTime?: FootballDataScorePart | null;
  penalties?: FootballDataScorePart | null;
};

export type FootballDataMatch = {
  id: number;
  utcDate: string;
  status: string;
  stage: string;
  homeTeam: FootballDataTeam;
  awayTeam: FootballDataTeam;
  score: FootballDataScore;
};

export type MappedMatchResult = {
  homeScore: number;
  awayScore: number;
  winnerSide: "HOME" | "AWAY" | null;
};
