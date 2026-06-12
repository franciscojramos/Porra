/** Código FIFA (3 letras) → ISO 3166-1 alpha-2 para emoji de bandera. */
const FIFA_TO_ISO2: Record<string, string> = {
  MEX: "MX",
  RSA: "ZA",
  KOR: "KR",
  CZE: "CZ",
  CAN: "CA",
  BIH: "BA",
  QAT: "QA",
  SUI: "CH",
  BRA: "BR",
  MAR: "MA",
  HTI: "HT",
  HAI: "HT",
  SCO: "GB",
  USA: "US",
  PAR: "PY",
  AUS: "AU",
  TUR: "TR",
  GER: "DE",
  CUW: "CW",
  CIV: "CI",
  ECU: "EC",
  NED: "NL",
  JPN: "JP",
  SWE: "SE",
  TUN: "TN",
  BEL: "BE",
  EGY: "EG",
  IRN: "IR",
  NZL: "NZ",
  ESP: "ES",
  CPV: "CV",
  KSA: "SA",
  URU: "UY",
  FRA: "FR",
  SEN: "SN",
  IRQ: "IQ",
  NOR: "NO",
  ARG: "AR",
  ALG: "DZ",
  AUT: "AT",
  JOR: "JO",
  POR: "PT",
  COD: "CD",
  UZB: "UZ",
  COL: "CO",
  ENG: "GB",
  CRO: "HR",
  GHA: "GH",
  PAN: "PA",
};

/** Banderas fijas cuando el emoji regional no basta (naciones UK, etc.). */
const FLAG_OVERRIDES: Record<string, string> = {
  ENG: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  SCO: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
};

function iso2ToFlag(iso2: string): string {
  const code = iso2.toUpperCase();
  if (code.length !== 2) return "";
  const a = code.charCodeAt(0) - 65 + 0x1f1e6;
  const b = code.charCodeAt(1) - 65 + 0x1f1e6;
  return String.fromCodePoint(a, b);
}

export function teamFlagEmoji(fifaCode: string | null | undefined): string {
  if (!fifaCode) return "";
  const upper = fifaCode.toUpperCase();
  if (FLAG_OVERRIDES[upper]) return FLAG_OVERRIDES[upper];
  const iso2 = FIFA_TO_ISO2[upper];
  if (!iso2) return "";
  if (upper === "ENG" || upper === "SCO") {
    return FLAG_OVERRIDES[upper] ?? iso2ToFlag(iso2);
  }
  return iso2ToFlag(iso2);
}

export function formatTeamDisplay(
  name: string,
  code?: string | null,
  options?: { showCode?: boolean }
): string {
  const flag = code ? teamFlagEmoji(code) : "";
  const prefix = flag ? `${flag} ` : "";
  const suffix = options?.showCode && code ? ` (${code})` : "";
  return `${prefix}${name}${suffix}`;
}
