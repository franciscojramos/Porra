import { formatTeamDisplay, teamFlagEmoji } from "@/lib/teamFlags";

type TeamLike = { name: string; code: string } | null | undefined;

export function TeamLabel({
  team,
  showCode = false,
  fallback = "—",
}: {
  team?: TeamLike;
  showCode?: boolean;
  fallback?: string;
}) {
  if (!team) return <>{fallback}</>;
  return <>{formatTeamDisplay(team.name, team.code, { showCode })}</>;
}

export function TeamFlag({ code }: { code?: string | null }) {
  const flag = teamFlagEmoji(code);
  if (!flag) return null;
  return (
    <span className="mr-1 inline-block shrink-0" aria-hidden>
      {flag}
    </span>
  );
}
