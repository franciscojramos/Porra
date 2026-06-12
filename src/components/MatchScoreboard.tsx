type Props = {
  homeName: string;
  awayName: string;
  homeScore?: number | null;
  awayScore?: number | null;
  size?: "lg" | "md";
};

export function MatchScoreboard({
  homeName,
  awayName,
  homeScore,
  awayScore,
  size = "lg",
}: Props) {
  const hasResult =
    homeScore !== null &&
    homeScore !== undefined &&
    awayScore !== null &&
    awayScore !== undefined;

  const teamClass =
    size === "lg"
      ? "text-base font-bold leading-snug sm:text-xl md:text-2xl"
      : "text-sm font-semibold leading-snug sm:text-base md:text-lg";
  const scoreClass =
    size === "lg"
      ? "text-2xl font-black tabular-nums sm:text-3xl md:text-4xl"
      : "text-lg font-black tabular-nums sm:text-xl md:text-2xl";

  return (
    <div className="space-y-3 sm:space-y-0">
      <div className="hidden items-center gap-3 sm:grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-4">
        <p className={`min-w-0 text-right text-white ${teamClass}`}>
          <span className="inline-block break-words">{homeName}</span>
        </p>
        <p
          className={`shrink-0 px-1 text-center ${scoreClass} ${
            hasResult ? "text-emerald-300" : "text-emerald-400"
          }`}
        >
          {hasResult ? `${homeScore} - ${awayScore}` : "vs"}
        </p>
        <p className={`min-w-0 text-left text-white ${teamClass}`}>
          <span className="inline-block break-words">{awayName}</span>
        </p>
      </div>

      <div className="sm:hidden">
        <div className={`text-center text-white ${teamClass}`}>
          <span className="inline-block break-words">{homeName}</span>
        </div>
        <p
          className={`my-2 text-center ${scoreClass} ${
            hasResult ? "text-emerald-300" : "text-emerald-400"
          }`}
        >
          {hasResult ? `${homeScore} - ${awayScore}` : "vs"}
        </p>
        <div className={`text-center text-white ${teamClass}`}>
          <span className="inline-block break-words">{awayName}</span>
        </div>
      </div>
    </div>
  );
}
