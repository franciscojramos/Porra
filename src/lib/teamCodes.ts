/** Códigos en BD que difieren del TLA de football-data.org. */
export const TEAM_CODE_TO_FOOTBALL_DATA: Record<string, string> = {
  HTI: "HAI",
};

export function toFootballDataTla(code: string) {
  return TEAM_CODE_TO_FOOTBALL_DATA[code] ?? code;
}

export function fromFootballDataTla(tla: string) {
  for (const [dbCode, apiTla] of Object.entries(TEAM_CODE_TO_FOOTBALL_DATA)) {
    if (apiTla === tla) return dbCode;
  }
  return tla;
}

export function teamCodesMatch(dbCode: string, apiTla: string) {
  return toFootballDataTla(dbCode) === apiTla;
}
