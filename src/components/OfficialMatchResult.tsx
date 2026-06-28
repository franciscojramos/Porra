import { getMatchAwayName, getMatchHomeName } from "@/lib/matchDisplay";
import { KnockoutTiebreakerNote, formatAdvancesTeam } from "@/components/KnockoutTiebreakerNote";

type MatchLike = {
  matchNumber?: number;
  homeTeamId?: string | null;
  awayTeamId?: string | null;
  homeLabel?: string | null;
  awayLabel?: string | null;
  homeScore: number | null;
  awayScore: number | null;
  winnerTeamId?: string | null;
  scorersHome?: string | null;
  scorersAway?: string | null;
};

type TeamLike = { id: string; name: string; code: string };

type PredictionLike = {
  homeScore: number;
  awayScore: number;
  points: number;
  advancesTeamId?: string | null;
} | null;

export function OfficialMatchResult({
  match,
  teamMap,
  prediction,
  compact = false,
  isKnockout = false,
}: {
  match: MatchLike;
  teamMap: Record<string, TeamLike | undefined>;
  prediction?: PredictionLike;
  compact?: boolean;
  isKnockout?: boolean;
}) {
  const hasResult = match.homeScore !== null && match.awayScore !== null;
  if (!hasResult) return null;

  const homeName = getMatchHomeName(match, teamMap);
  const awayName = getMatchAwayName(match, teamMap);
  const officialTie = match.homeScore === match.awayScore;
  const officialWinner = formatAdvancesTeam(match.winnerTeamId, teamMap);

  if (compact) {
    return (
      <span className="text-xs text-emerald-300">
        Real: <strong>{match.homeScore}-{match.awayScore}</strong>
        {isKnockout && officialTie && officialWinner && (
          <span className="ml-1 text-emerald-200">· pasa {officialWinner}</span>
        )}
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
        {isKnockout && officialTie && officialWinner && (
          <span className="text-emerald-100">Pasa: {officialWinner}</span>
        )}
        {prediction !== undefined && prediction !== null && (
          <>
            <span className="text-emerald-100">
              Pronóstico: {prediction.homeScore} - {prediction.awayScore}
            </span>
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-200">
              +{prediction.points} pts
            </span>
          </>
        )}
      </div>
      {isKnockout && prediction && (
        <KnockoutTiebreakerNote
          homeScore={prediction.homeScore}
          awayScore={prediction.awayScore}
          advancesTeamId={prediction.advancesTeamId}
          teamMap={teamMap}
          label="Pronóstico · pasa"
        />
      )}
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
