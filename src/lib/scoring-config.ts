/** Reglas oficiales de puntuación — fuente única para seed, admin y /reglas */
export type ScoringRule = {
  key: string;
  points: number;
  label: string;
  phase: "fase1" | "fase2";
  block: string;
};

export const SCORING_RULES: ScoringRule[] = [
  // Fase 1 — Partidos de grupos
  {
    key: "group_match_1x2",
    points: 3,
    label: "Grupos · Acertar 1X2 (ganador o empate)",
    phase: "fase1",
    block: "Partidos de grupos",
  },
  {
    key: "group_match_exact_bonus",
    points: 2,
    label: "Grupos · Bonus marcador exacto (+2, total 5)",
    phase: "fase1",
    block: "Partidos de grupos",
  },
  // Fase 1 — Clasificación
  {
    key: "group_standing_top2",
    points: 4,
    label: "Grupo · Acertar los 2 clasificados (sin orden)",
    phase: "fase1",
    block: "Clasificación de grupos",
  },
  {
    key: "group_standing_top2_order_bonus",
    points: 3,
    label: "Grupo · Bonus orden exacto 1º y 2º (+3, total 7)",
    phase: "fase1",
    block: "Clasificación de grupos",
  },
  {
    key: "group_standing_third",
    points: 2,
    label: "Grupo · Acertar el 3º puesto",
    phase: "fase1",
    block: "Clasificación de grupos",
  },
  {
    key: "best_third",
    points: 3,
    label: "Mejores terceros · Por cada acierto (máx. 24)",
    phase: "fase1",
    block: "Clasificación de grupos",
  },
  // Fase 1 — Premios
  {
    key: "award_young",
    points: 15,
    label: "Mejor jugador joven",
    phase: "fase1",
    block: "Premios individuales",
  },
  {
    key: "award_ball",
    points: 15,
    label: "Balón de Oro (MVP)",
    phase: "fase1",
    block: "Premios individuales",
  },
  {
    key: "award_glove",
    points: 15,
    label: "Guante de Oro (mejor portero)",
    phase: "fase1",
    block: "Premios individuales",
  },
  {
    key: "boot_top3_each",
    points: 10,
    label: "Bota de Oro · Por jugador en el Top 3 (sin orden)",
    phase: "fase1",
    block: "Premios individuales",
  },
  {
    key: "boot_order_bonus",
    points: 10,
    label: "Bota de Oro · Bonus orden exacto 1º-2º-3º",
    phase: "fase1",
    block: "Premios individuales",
  },
  // Fase 2 — Eliminatorias (partidos)
  {
    key: "ko_r32_r16_1x2",
    points: 5,
    label: "Dieciseisavos/Octavos · Acertar 1X2",
    phase: "fase2",
    block: "Partidos eliminatorias",
  },
  {
    key: "ko_r32_r16_exact_bonus",
    points: 3,
    label: "Dieciseisavos/Octavos · Bonus marcador exacto (+3, total 8)",
    phase: "fase2",
    block: "Partidos eliminatorias",
  },
  {
    key: "ko_quarter_semi_1x2",
    points: 8,
    label: "Cuartos/Semifinal · Acertar 1X2",
    phase: "fase2",
    block: "Partidos eliminatorias",
  },
  {
    key: "ko_quarter_semi_exact_bonus",
    points: 4,
    label: "Cuartos/Semifinal · Bonus marcador exacto (+4, total 12)",
    phase: "fase2",
    block: "Partidos eliminatorias",
  },
  // Fase 2 — Cuadro de honor
  {
    key: "bracket_fourth",
    points: 15,
    label: "Cuadro final · Acertar 4º puesto",
    phase: "fase2",
    block: "Cuadro de honor",
  },
  {
    key: "bracket_third",
    points: 15,
    label: "Cuadro final · Acertar 3º puesto",
    phase: "fase2",
    block: "Cuadro de honor",
  },
  {
    key: "bracket_runner_up",
    points: 25,
    label: "Cuadro final · Acertar subcampeón",
    phase: "fase2",
    block: "Cuadro de honor",
  },
  {
    key: "bracket_champion",
    points: 40,
    label: "Cuadro final · Acertar campeón del mundo",
    phase: "fase2",
    block: "Cuadro de honor",
  },
];

export const SCORING_PHASE_LABELS: Record<ScoringRule["phase"], string> = {
  fase1: "Fase 1 · Pronóstico inicial (grupos + premios)",
  fase2: "Fase 2 · Eliminatorias + cuadro de honor",
};
