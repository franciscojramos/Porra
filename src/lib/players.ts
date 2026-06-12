import squadsData from "../../worldcup.squads.json";
import { AwardCategory } from "@prisma/client";

type SquadPlayer = {
  number: number;
  pos: string;
  name: string;
  date_of_birth: string;
};

type Squad = {
  name: string;
  fifa_code: string;
  group: string;
  players: SquadPlayer[];
};

/** FIFA: nacidos el 1 de enero de (año del torneo − 21) o después. */
const YOUNG_PLAYER_CUTOFF = "2005-01-01";

export type PlayerOption = {
  value: string;
  label: string;
  teamName: string;
  teamCode: string;
};

const squads = squadsData as Squad[];

/** Códigos en BD que difieren del JSON FIFA. */
const TEAM_CODE_ALIASES: Record<string, string> = {
  HTI: "HAI",
};

function formatPlayerValue(name: string, teamCode: string) {
  return `${name} (${teamCode})`;
}

function squadCodeForTeamCode(code: string) {
  return TEAM_CODE_ALIASES[code] ?? code;
}

function toOption(squad: Squad, player: SquadPlayer): PlayerOption {
  return {
    value: formatPlayerValue(player.name, squad.fifa_code),
    label: `${player.name} · ${squad.name}`,
    teamName: squad.name,
    teamCode: squad.fifa_code,
  };
}

const allOptions: PlayerOption[] = squads.flatMap((squad) =>
  squad.players.map((player) => toOption(squad, player))
);

const goalkeeperOptions: PlayerOption[] = squads.flatMap((squad) =>
  squad.players.filter((p) => p.pos === "GK").map((player) => toOption(squad, player))
);

const scorerOptions: PlayerOption[] = squads.flatMap((squad) =>
  squad.players.filter((p) => p.pos !== "GK").map((player) => toOption(squad, player))
);

const youngOptions: PlayerOption[] = squads.flatMap((squad) =>
  squad.players
    .filter((p) => p.date_of_birth >= YOUNG_PLAYER_CUTOFF)
    .map((player) => toOption(squad, player))
);

function sortOptions(options: PlayerOption[]) {
  return [...options].sort((a, b) => {
    const team = a.teamName.localeCompare(b.teamName, "es");
    if (team !== 0) return team;
    return a.label.localeCompare(b.label, "es");
  });
}

const OPTIONS_BY_CATEGORY: Record<AwardCategory, PlayerOption[]> = {
  GOLDEN_BALL: sortOptions(allOptions),
  GOLDEN_BOOT: sortOptions(scorerOptions),
  GOLDEN_GLOVE: sortOptions(goalkeeperOptions),
  BEST_YOUNG: sortOptions(youngOptions),
};

export function getPlayerOptionsForAward(category: AwardCategory) {
  return OPTIONS_BY_CATEGORY[category];
}

const allowedValuesByCategory = Object.fromEntries(
  (Object.keys(OPTIONS_BY_CATEGORY) as AwardCategory[]).map((category) => [
    category,
    new Set(OPTIONS_BY_CATEGORY[category].map((p) => p.value)),
  ])
) as Record<AwardCategory, Set<string>>;

export function isValidAwardPlayer(category: AwardCategory, value: string | null) {
  if (!value) return true;
  return allowedValuesByCategory[category].has(value);
}

export function normalizeStoredPlayer(value: string | null, category: AwardCategory) {
  if (!value) return null;
  const trimmed = value.trim();
  if (allowedValuesByCategory[category].has(trimmed)) return trimmed;

  const options = OPTIONS_BY_CATEGORY[category];
  const byName = options.find(
    (p) => p.value.toLowerCase().startsWith(trimmed.toLowerCase()) || p.label.toLowerCase().startsWith(trimmed.toLowerCase())
  );
  return byName?.value ?? trimmed;
}

export function getPlayersByTeamCode(teamCode: string | null | undefined): PlayerOption[] {
  if (!teamCode) return [];
  const squad = squads.find((s) => s.fifa_code === squadCodeForTeamCode(teamCode));
  if (!squad) return [];
  return squad.players
    .map((player) => toOption(squad, player))
    .sort((a, b) => a.label.localeCompare(b.label, "es"));
}

export function parseScorers(value: string | null | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Clave normalizada para agrupar el mismo jugador (ignora código FIFA). */
export function normalizePlayerKey(value: string) {
  return value.replace(/\s*\([A-Z]{3}\)\s*$/, "").trim().toLowerCase();
}

export function displayPlayerLabel(value: string) {
  return value.trim();
}

export function formatScorers(values: string[]) {
  return values.filter(Boolean).join(", ") || null;
}

export function normalizeScorerSelection(
  value: string,
  teamCode: string | null | undefined
): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const options = getPlayersByTeamCode(teamCode);
  if (options.some((p) => p.value === trimmed)) return trimmed;
  const match = options.find(
    (p) =>
      p.value.toLowerCase().startsWith(trimmed.toLowerCase()) ||
      p.label.toLowerCase().startsWith(trimmed.toLowerCase())
  );
  return match?.value ?? trimmed;
}
