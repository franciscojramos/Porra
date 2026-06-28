import { formatTeamDisplay } from "@/lib/teamFlags";

type TeamLike = { id: string; name: string; code: string };

export function formatAdvancesTeam(
  teamId: string | null | undefined,
  teamMap: Record<string, TeamLike | undefined>
) {
  if (!teamId || !teamMap[teamId]) return null;
  const team = teamMap[teamId]!;
  return formatTeamDisplay(team.name, team.code);
}

export function KnockoutTiebreakerNote({
  homeScore,
  awayScore,
  advancesTeamId,
  teamMap,
  label = "Pasa",
}: {
  homeScore: number;
  awayScore: number;
  advancesTeamId?: string | null;
  teamMap: Record<string, TeamLike | undefined>;
  label?: string;
}) {
  if (homeScore !== awayScore) return null;
  const name = formatAdvancesTeam(advancesTeamId, teamMap);
  if (!name) {
    return (
      <p className="text-xs text-amber-300">
        Empate {homeScore}-{awayScore} · sin elegir quién pasa
      </p>
    );
  }
  return (
    <p className="text-xs text-amber-200">
      {label}: <strong>{name}</strong> (empate {homeScore}-{awayScore})
    </p>
  );
}
