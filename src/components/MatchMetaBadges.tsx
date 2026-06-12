import { formatKickoff } from "@/lib/matchDisplay";

type MatchLike = {
  matchNumber?: number;
  groupId?: string | null;
  kickoffAt?: Date | null;
  stadium?: string | null;
};

export function MatchMetaBadges({
  match,
  className = "",
}: {
  match: MatchLike;
  className?: string;
}) {
  const kickoff = formatKickoff(match.kickoffAt);
  const items: string[] = [];

  if (match.matchNumber !== undefined) items.push(`#${match.matchNumber}`);
  if (match.groupId) items.push(`Grupo ${match.groupId}`);
  if (kickoff) items.push(kickoff);
  if (match.stadium) items.push(match.stadium);

  if (items.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {items.map((item) => (
        <span
          key={item}
          className="max-w-full break-words rounded-full bg-white/5 px-2.5 py-1 text-xs text-emerald-100 sm:px-3 sm:text-sm"
        >
          {item}
        </span>
      ))}
    </div>
  );
}
