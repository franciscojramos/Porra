type TeamLike = { id: string; name: string; code: string } | undefined;

type MatchLike = {
  matchNumber?: number;
  homeTeamId?: string | null;
  awayTeamId?: string | null;
  homeLabel?: string | null;
  awayLabel?: string | null;
  kickoffAt?: Date | null;
  stadium?: string | null;
  groupId?: string | null;
};

export function formatKickoff(date: Date | null | undefined) {
  if (!date) return null;
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getMatchHomeName(
  match: MatchLike,
  teamMap: Record<string, TeamLike>
) {
  if (match.homeTeamId && teamMap[match.homeTeamId]) {
    return teamMap[match.homeTeamId]!.name;
  }
  return match.homeLabel ?? "—";
}

export function getMatchAwayName(
  match: MatchLike,
  teamMap: Record<string, TeamLike>
) {
  if (match.awayTeamId && teamMap[match.awayTeamId]) {
    return teamMap[match.awayTeamId]!.name;
  }
  return match.awayLabel ?? "—";
}

export function getMatchMeta(match: MatchLike) {
  const parts: string[] = [];
  if (match.matchNumber !== undefined) parts.push(`#${match.matchNumber}`);
  if (match.groupId) parts.push(`Grupo ${match.groupId}`);
  const kickoff = formatKickoff(match.kickoffAt);
  if (kickoff) parts.push(kickoff);
  if (match.stadium) parts.push(match.stadium);
  return parts.join(" · ");
}
