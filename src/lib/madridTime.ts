export function formatMadridDateTime(date: Date | null | undefined) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("es-ES", {
    timeZone: "Europe/Madrid",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatMadridDate(date: Date | null | undefined) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("es-ES", {
    timeZone: "Europe/Madrid",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function madridDateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export type MatchStatus = "finished" | "live" | "upcoming" | "scheduled";

export function getMatchStatus(match: {
  kickoffAt: Date | null;
  homeScore: number | null;
  awayScore: number | null;
}): MatchStatus {
  if (match.homeScore !== null && match.awayScore !== null) {
    return "finished";
  }
  if (!match.kickoffAt) return "scheduled";

  const now = Date.now();
  const kickoff = match.kickoffAt.getTime();
  const liveUntil = kickoff + 105 * 60 * 1000;

  if (now < kickoff) return "upcoming";
  if (now <= liveUntil) return "live";
  return "finished";
}

export const STATUS_LABELS: Record<MatchStatus, string> = {
  finished: "Finalizado",
  live: "En juego",
  upcoming: "Próximo",
  scheduled: "Programado",
};
