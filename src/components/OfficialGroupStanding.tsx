import { formatTeamDisplay } from "@/lib/teamFlags";

type TeamLike = { id: string; name: string; code: string };

export function OfficialGroupStanding({
  groupId,
  standing,
  teamMap,
  userStanding,
}: {
  groupId: string;
  standing: {
    firstTeamId: string;
    secondTeamId: string;
    thirdTeamId: string;
    fourthTeamId: string;
  };
  teamMap: Record<string, TeamLike | undefined>;
  userStanding?: {
    firstTeamId: string;
    secondTeamId: string;
    thirdTeamId: string;
    fourthTeamId: string;
    points: number;
  } | null;
}) {
  const rows = [
    ["1º", standing.firstTeamId],
    ["2º", standing.secondTeamId],
    ["3º", standing.thirdTeamId],
    ["4º", standing.fourthTeamId],
  ] as const;

  return (
    <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
          Clasificación real · Grupo {groupId}
        </p>
        {userStanding !== undefined && userStanding !== null && (
          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-200">
            +{userStanding.points} pts
          </span>
        )}
      </div>
      <ol className="space-y-1 text-sm text-emerald-100">
        {rows.map(([pos, teamId]) => {
          const team = teamMap[teamId];
          const hit =
            userStanding &&
            ((pos === "1º" && userStanding.firstTeamId === teamId) ||
              (pos === "2º" && userStanding.secondTeamId === teamId) ||
              (pos === "3º" && userStanding.thirdTeamId === teamId) ||
              (pos === "4º" && userStanding.fourthTeamId === teamId));

          return (
            <li key={pos} className={hit ? "text-emerald-300" : undefined}>
              {pos}: {team ? formatTeamDisplay(team.name, team.code) : "—"}
              {hit && <span className="ml-1 text-xs text-amber-200">✓</span>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
