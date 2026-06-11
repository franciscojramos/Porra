import { getMatchMeta } from "@/lib/matchDisplay";

export function MatchMeta({
  match,
}: {
  match: {
    matchNumber: number;
    groupId?: string | null;
    kickoffAt?: Date | null;
    stadium?: string | null;
  };
}) {
  return (
    <p className="w-full text-xs text-emerald-400">{getMatchMeta(match)}</p>
  );
}
