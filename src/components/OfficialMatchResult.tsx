import { getMatchAwayName, getMatchHomeName } from "@/lib/matchDisplay";

type MatchLike = {
  matchNumber?: number;
  homeTeamId?: string | null;
  awayTeamId?: string | null;
  homeLabel?: string | null;
  awayLabel?: string | null;
  homeScore: number | null;
  awayScore: number | null;
  scorersHome?: string | null;
  scorersAway?: string | null;
};

type TeamLike = { id: string; name: string; code: string };

export function OfficialMatchResult({
  match,
  teamMap,
  prediction,
  compact = false,
}: {
  match: MatchLike;
  teamMap: Record<string, TeamLike | undefined>;
  prediction?: { homeScore: number; awayScore: number; points: number } | null;
  compact?: boolean;
}) {
  const hasResult = match.homeScore !== null && match.awayScore !== null;
  if (!hasResult) return null;

  const homeName = getMatchHomeName(match, teamMap);
  const awayName = getMatchAwayName(match, teamMap);

  if (compact) {
    return (
      <span className="text-xs text-emerald-300">
        Real: <strong>{match.homeScore}-{match.awayScore}</strong>
        {prediction !== undefined && prediction !== null && (
          <span className="ml-2 text-amber-200">+{prediction.points} pts</span>
        )}
      </span>
    );
  }

  return (
    <div className="w-full rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-sm">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-semibold text-emerald-300">
          Resultado real: {match.homeScore} - {match.awayScore}
        </span>
        {prediction !== undefined && prediction !== null && (
          <>
            <span className="text-emerald-100">
              Tu pronóstico: {prediction.homeScore} - {prediction.awayScore}
            </span>
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-200">
              +{prediction.points} pts
            </span>
          </>
        )}
      </div>
      {(match.scorersHome || match.scorersAway) && (
        <div className="mt-1 space-y-0.5 text-xs text-emerald-200">
          {match.scorersHome && (
            <p>
              <strong>{homeName}:</strong> {match.scorersHome}
            </p>
          )}
          {match.scorersAway && (
            <p>
              <strong>{awayName}:</strong> {match.scorersAway}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
