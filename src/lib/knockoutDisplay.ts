import {
  computeProgressiveBracketState,
  teamDisplayName,
  type KnockoutMatchInput,
  type StandingByGroup,
  type TeamInfo,
} from "./knockoutBracketResolve";

type MatchLike = KnockoutMatchInput & {
  kickoffAt?: Date | null;
  stadium?: string | null;
};

/** Equipos oficiales de cada cruce KO (R32 + árbol progresivo). */
export function buildOfficialKnockoutSlots(
  matches: MatchLike[],
  officialStandings: StandingByGroup,
  officialBestThirdIds: string[],
  officialWinners: Record<number, string>,
  officialLosers: Record<number, string>
) {
  return computeProgressiveBracketState(
    matches,
    {},
    {},
    [],
    new Map(Object.entries(officialWinners).map(([k, v]) => [Number(k), v])),
    new Map(Object.entries(officialLosers).map(([k, v]) => [Number(k), v])),
    officialStandings,
    officialBestThirdIds
  ).slots;
}

export function getKnockoutMatchHomeName(
  match: MatchLike,
  teamMap: Record<string, TeamInfo | undefined>,
  slots: ReturnType<typeof buildOfficialKnockoutSlots>
) {
  const slot = slots[match.id];
  return teamDisplayName(slot?.homeTeamId ?? null, match.homeLabel ?? null, teamMap);
}

export function getKnockoutMatchAwayName(
  match: MatchLike,
  teamMap: Record<string, TeamInfo | undefined>,
  slots: ReturnType<typeof buildOfficialKnockoutSlots>
) {
  const slot = slots[match.id];
  return teamDisplayName(slot?.awayTeamId ?? null, match.awayLabel ?? null, teamMap);
}
