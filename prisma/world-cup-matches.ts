import { MatchStage } from "@prisma/client";

export const GROUPS: Record<string, { code: string; name: string }[]> = {
  A: [
    { code: "MEX", name: "México" },
    { code: "RSA", name: "Sudáfrica" },
    { code: "KOR", name: "Corea del Sur" },
    { code: "CZE", name: "República Checa" },
  ],
  B: [
    { code: "CAN", name: "Canadá" },
    { code: "BIH", name: "Bosnia y Herzegovina" },
    { code: "QAT", name: "Catar" },
    { code: "SUI", name: "Suiza" },
  ],
  C: [
    { code: "BRA", name: "Brasil" },
    { code: "MAR", name: "Marruecos" },
    { code: "HTI", name: "Haití" },
    { code: "SCO", name: "Escocia" },
  ],
  D: [
    { code: "USA", name: "Estados Unidos" },
    { code: "PAR", name: "Paraguay" },
    { code: "AUS", name: "Australia" },
    { code: "TUR", name: "Turquía" },
  ],
  E: [
    { code: "GER", name: "Alemania" },
    { code: "CUW", name: "Curazao" },
    { code: "CIV", name: "Costa de Marfil" },
    { code: "ECU", name: "Ecuador" },
  ],
  F: [
    { code: "NED", name: "Países Bajos" },
    { code: "JPN", name: "Japón" },
    { code: "SWE", name: "Suecia" },
    { code: "TUN", name: "Túnez" },
  ],
  G: [
    { code: "BEL", name: "Bélgica" },
    { code: "EGY", name: "Egipto" },
    { code: "IRN", name: "Irán" },
    { code: "NZL", name: "Nueva Zelanda" },
  ],
  H: [
    { code: "ESP", name: "España" },
    { code: "CPV", name: "Islas de Cabo Verde" },
    { code: "KSA", name: "Arabia Saudí" },
    { code: "URU", name: "Uruguay" },
  ],
  I: [
    { code: "FRA", name: "Francia" },
    { code: "SEN", name: "Senegal" },
    { code: "IRQ", name: "Irak" },
    { code: "NOR", name: "Noruega" },
  ],
  J: [
    { code: "ARG", name: "Argentina" },
    { code: "ALG", name: "Argelia" },
    { code: "AUT", name: "Austria" },
    { code: "JOR", name: "Jordania" },
  ],
  K: [
    { code: "POR", name: "Portugal" },
    { code: "COD", name: "RD Congo" },
    { code: "UZB", name: "Uzbekistán" },
    { code: "COL", name: "Colombia" },
  ],
  L: [
    { code: "ENG", name: "Inglaterra" },
    { code: "CRO", name: "Croacia" },
    { code: "GHA", name: "Ghana" },
    { code: "PAN", name: "Panamá" },
  ],
};

type GroupMatchSeed = {
  number: number;
  groupId: string;
  home: string;
  away: string;
  stadium: string;
  kickoffAt: string;
};

type KnockoutMatchSeed = {
  number: number;
  stage: MatchStage;
  homeLabel: string;
  awayLabel: string;
  stadium: string;
  kickoffAt: string;
};

export const GROUP_MATCHES: GroupMatchSeed[] = [
  { number: 1, groupId: "A", home: "MEX", away: "RSA", stadium: "Mexico City Stadium", kickoffAt: "2026-06-11T21:00:00" },
  { number: 2, groupId: "A", home: "KOR", away: "CZE", stadium: "Guadalajara Stadium", kickoffAt: "2026-06-12T04:00:00" },
  { number: 3, groupId: "B", home: "CAN", away: "BIH", stadium: "Toronto Stadium", kickoffAt: "2026-06-12T21:00:00" },
  { number: 4, groupId: "D", home: "USA", away: "PAR", stadium: "Los Angeles Stadium", kickoffAt: "2026-06-13T03:00:00" },
  { number: 5, groupId: "C", home: "HTI", away: "SCO", stadium: "Boston Stadium", kickoffAt: "2026-06-14T03:00:00" },
  { number: 6, groupId: "D", home: "AUS", away: "TUR", stadium: "Vancouver Stadium", kickoffAt: "2026-06-14T06:00:00" },
  { number: 7, groupId: "C", home: "BRA", away: "MAR", stadium: "New York New Jersey Stadium", kickoffAt: "2026-06-14T00:00:00" },
  { number: 8, groupId: "B", home: "QAT", away: "SUI", stadium: "San Francisco Bay Area Stadium", kickoffAt: "2026-06-13T21:00:00" },
  { number: 9, groupId: "E", home: "CIV", away: "ECU", stadium: "Philadelphia Stadium", kickoffAt: "2026-06-15T01:00:00" },
  { number: 10, groupId: "E", home: "GER", away: "CUW", stadium: "Houston Stadium", kickoffAt: "2026-06-14T19:00:00" },
  { number: 11, groupId: "F", home: "NED", away: "JPN", stadium: "Dallas Stadium", kickoffAt: "2026-06-14T22:00:00" },
  { number: 12, groupId: "F", home: "SWE", away: "TUN", stadium: "Monterrey Stadium", kickoffAt: "2026-06-15T04:00:00" },
  { number: 13, groupId: "H", home: "KSA", away: "URU", stadium: "Miami Stadium", kickoffAt: "2026-06-16T00:00:00" },
  { number: 14, groupId: "H", home: "ESP", away: "CPV", stadium: "Atlanta Stadium", kickoffAt: "2026-06-15T18:00:00" },
  { number: 15, groupId: "G", home: "IRN", away: "NZL", stadium: "Los Angeles Stadium", kickoffAt: "2026-06-16T03:00:00" },
  { number: 16, groupId: "G", home: "BEL", away: "EGY", stadium: "Seattle Stadium", kickoffAt: "2026-06-15T21:00:00" },
  { number: 17, groupId: "I", home: "FRA", away: "SEN", stadium: "New York New Jersey Stadium", kickoffAt: "2026-06-16T21:00:00" },
  { number: 18, groupId: "I", home: "IRQ", away: "NOR", stadium: "Boston Stadium", kickoffAt: "2026-06-17T00:00:00" },
  { number: 19, groupId: "J", home: "ARG", away: "ALG", stadium: "Kansas City Stadium", kickoffAt: "2026-06-17T03:00:00" },
  { number: 20, groupId: "J", home: "AUT", away: "JOR", stadium: "San Francisco Bay Area Stadium", kickoffAt: "2026-06-17T06:00:00" },
  { number: 21, groupId: "L", home: "GHA", away: "PAN", stadium: "Toronto Stadium", kickoffAt: "2026-06-18T01:00:00" },
  { number: 22, groupId: "L", home: "ENG", away: "CRO", stadium: "Dallas Stadium", kickoffAt: "2026-06-17T22:00:00" },
  { number: 23, groupId: "K", home: "POR", away: "COD", stadium: "Houston Stadium", kickoffAt: "2026-06-17T19:00:00" },
  { number: 24, groupId: "K", home: "UZB", away: "COL", stadium: "Mexico City Stadium", kickoffAt: "2026-06-18T04:00:00" },
  { number: 25, groupId: "A", home: "CZE", away: "RSA", stadium: "Atlanta Stadium", kickoffAt: "2026-06-18T18:00:00" },
  { number: 26, groupId: "B", home: "SUI", away: "BIH", stadium: "Los Angeles Stadium", kickoffAt: "2026-06-18T21:00:00" },
  { number: 27, groupId: "B", home: "CAN", away: "QAT", stadium: "Vancouver Stadium", kickoffAt: "2026-06-19T00:00:00" },
  { number: 28, groupId: "A", home: "MEX", away: "KOR", stadium: "Guadalajara Stadium", kickoffAt: "2026-06-19T03:00:00" },
  { number: 29, groupId: "C", home: "BRA", away: "HTI", stadium: "Philadelphia Stadium", kickoffAt: "2026-06-20T02:30:00" },
  { number: 30, groupId: "C", home: "SCO", away: "MAR", stadium: "Boston Stadium", kickoffAt: "2026-06-20T00:00:00" },
  { number: 31, groupId: "D", home: "TUR", away: "PAR", stadium: "San Francisco Bay Area Stadium", kickoffAt: "2026-06-20T05:00:00" },
  { number: 32, groupId: "D", home: "USA", away: "AUS", stadium: "Seattle Stadium", kickoffAt: "2026-06-19T21:00:00" },
  { number: 33, groupId: "E", home: "GER", away: "CIV", stadium: "Toronto Stadium", kickoffAt: "2026-06-20T22:00:00" },
  { number: 34, groupId: "E", home: "ECU", away: "CUW", stadium: "Kansas City Stadium", kickoffAt: "2026-06-21T02:00:00" },
  { number: 35, groupId: "F", home: "NED", away: "SWE", stadium: "Houston Stadium", kickoffAt: "2026-06-20T19:00:00" },
  { number: 36, groupId: "F", home: "TUN", away: "JPN", stadium: "Monterrey Stadium", kickoffAt: "2026-06-21T06:00:00" },
  { number: 37, groupId: "H", home: "URU", away: "CPV", stadium: "Miami Stadium", kickoffAt: "2026-06-22T00:00:00" },
  { number: 38, groupId: "H", home: "ESP", away: "KSA", stadium: "Atlanta Stadium", kickoffAt: "2026-06-21T18:00:00" },
  { number: 39, groupId: "G", home: "BEL", away: "IRN", stadium: "Los Angeles Stadium", kickoffAt: "2026-06-21T21:00:00" },
  { number: 40, groupId: "G", home: "NZL", away: "EGY", stadium: "Vancouver Stadium", kickoffAt: "2026-06-22T03:00:00" },
  { number: 41, groupId: "I", home: "NOR", away: "SEN", stadium: "New York New Jersey Stadium", kickoffAt: "2026-06-23T02:00:00" },
  { number: 42, groupId: "I", home: "FRA", away: "IRQ", stadium: "Philadelphia Stadium", kickoffAt: "2026-06-22T23:00:00" },
  { number: 43, groupId: "J", home: "ARG", away: "AUT", stadium: "Dallas Stadium", kickoffAt: "2026-06-22T19:00:00" },
  { number: 44, groupId: "J", home: "JOR", away: "ALG", stadium: "San Francisco Bay Area Stadium", kickoffAt: "2026-06-23T05:00:00" },
  { number: 45, groupId: "L", home: "ENG", away: "GHA", stadium: "Boston Stadium", kickoffAt: "2026-06-23T22:00:00" },
  { number: 46, groupId: "L", home: "PAN", away: "CRO", stadium: "Toronto Stadium", kickoffAt: "2026-06-24T01:00:00" },
  { number: 47, groupId: "K", home: "POR", away: "UZB", stadium: "Houston Stadium", kickoffAt: "2026-06-23T19:00:00" },
  { number: 48, groupId: "K", home: "COL", away: "COD", stadium: "Guadalajara Stadium", kickoffAt: "2026-06-24T04:00:00" },
  { number: 49, groupId: "C", home: "SCO", away: "BRA", stadium: "Miami Stadium", kickoffAt: "2026-06-25T00:00:00" },
  { number: 50, groupId: "C", home: "MAR", away: "HTI", stadium: "Atlanta Stadium", kickoffAt: "2026-06-25T00:00:00" },
  { number: 51, groupId: "B", home: "SUI", away: "CAN", stadium: "Vancouver Stadium", kickoffAt: "2026-06-24T21:00:00" },
  { number: 52, groupId: "B", home: "BIH", away: "QAT", stadium: "Seattle Stadium", kickoffAt: "2026-06-24T21:00:00" },
  { number: 53, groupId: "A", home: "CZE", away: "MEX", stadium: "Mexico City Stadium", kickoffAt: "2026-06-25T03:00:00" },
  { number: 54, groupId: "A", home: "RSA", away: "KOR", stadium: "Monterrey Stadium", kickoffAt: "2026-06-25T03:00:00" },
  { number: 55, groupId: "E", home: "CUW", away: "CIV", stadium: "Philadelphia Stadium", kickoffAt: "2026-06-25T22:00:00" },
  { number: 56, groupId: "E", home: "ECU", away: "GER", stadium: "New York New Jersey Stadium", kickoffAt: "2026-06-25T22:00:00" },
  { number: 57, groupId: "F", home: "JPN", away: "SWE", stadium: "Dallas Stadium", kickoffAt: "2026-06-26T01:00:00" },
  { number: 58, groupId: "F", home: "TUN", away: "NED", stadium: "Kansas City Stadium", kickoffAt: "2026-06-26T01:00:00" },
  { number: 59, groupId: "D", home: "TUR", away: "USA", stadium: "Los Angeles Stadium", kickoffAt: "2026-06-26T04:00:00" },
  { number: 60, groupId: "D", home: "PAR", away: "AUS", stadium: "San Francisco Bay Area Stadium", kickoffAt: "2026-06-26T04:00:00" },
  { number: 61, groupId: "I", home: "NOR", away: "FRA", stadium: "Boston Stadium", kickoffAt: "2026-06-26T21:00:00" },
  { number: 62, groupId: "I", home: "SEN", away: "IRQ", stadium: "Toronto Stadium", kickoffAt: "2026-06-26T21:00:00" },
  { number: 63, groupId: "G", home: "EGY", away: "IRN", stadium: "Seattle Stadium", kickoffAt: "2026-06-27T05:00:00" },
  { number: 64, groupId: "G", home: "NZL", away: "BEL", stadium: "Vancouver Stadium", kickoffAt: "2026-06-27T05:00:00" },
  { number: 65, groupId: "H", home: "CPV", away: "KSA", stadium: "Houston Stadium", kickoffAt: "2026-06-27T02:00:00" },
  { number: 66, groupId: "H", home: "URU", away: "ESP", stadium: "Guadalajara Stadium", kickoffAt: "2026-06-27T02:00:00" },
  { number: 67, groupId: "L", home: "PAN", away: "ENG", stadium: "New York New Jersey Stadium", kickoffAt: "2026-06-27T23:00:00" },
  { number: 68, groupId: "L", home: "CRO", away: "GHA", stadium: "Philadelphia Stadium", kickoffAt: "2026-06-27T23:00:00" },
  { number: 69, groupId: "J", home: "ALG", away: "AUT", stadium: "Kansas City Stadium", kickoffAt: "2026-06-28T04:00:00" },
  { number: 70, groupId: "J", home: "JOR", away: "ARG", stadium: "Dallas Stadium", kickoffAt: "2026-06-28T04:00:00" },
  { number: 71, groupId: "K", home: "COL", away: "POR", stadium: "Miami Stadium", kickoffAt: "2026-06-28T01:30:00" },
  { number: 72, groupId: "K", home: "COD", away: "UZB", stadium: "Atlanta Stadium", kickoffAt: "2026-06-28T01:30:00" },
];

export const KNOCKOUT_MATCHES: KnockoutMatchSeed[] = [
  { number: 73, stage: MatchStage.ROUND_32, homeLabel: "2A", awayLabel: "2B", stadium: "Los Angeles Stadium", kickoffAt: "2026-06-28T21:00:00" },
  { number: 74, stage: MatchStage.ROUND_32, homeLabel: "1E", awayLabel: "3ABCDF", stadium: "Boston Stadium", kickoffAt: "2026-06-29T22:30:00" },
  { number: 75, stage: MatchStage.ROUND_32, homeLabel: "1F", awayLabel: "2C", stadium: "Monterrey Stadium", kickoffAt: "2026-06-30T03:00:00" },
  { number: 76, stage: MatchStage.ROUND_32, homeLabel: "1C", awayLabel: "2F", stadium: "Houston Stadium", kickoffAt: "2026-06-29T19:00:00" },
  { number: 77, stage: MatchStage.ROUND_32, homeLabel: "1I", awayLabel: "3CDFGH", stadium: "New York New Jersey Stadium", kickoffAt: "2026-06-30T23:00:00" },
  { number: 78, stage: MatchStage.ROUND_32, homeLabel: "2E", awayLabel: "2I", stadium: "Dallas Stadium", kickoffAt: "2026-06-30T19:00:00" },
  { number: 79, stage: MatchStage.ROUND_32, homeLabel: "1A", awayLabel: "3CEFHI", stadium: "Mexico City Stadium", kickoffAt: "2026-07-01T03:00:00" },
  { number: 80, stage: MatchStage.ROUND_32, homeLabel: "1L", awayLabel: "3EHIJK", stadium: "Atlanta Stadium", kickoffAt: "2026-07-01T18:00:00" },
  { number: 81, stage: MatchStage.ROUND_32, homeLabel: "1D", awayLabel: "3BEFIJ", stadium: "San Francisco Bay Area Stadium", kickoffAt: "2026-07-02T02:00:00" },
  { number: 82, stage: MatchStage.ROUND_32, homeLabel: "1G", awayLabel: "3AEHIJ", stadium: "Seattle Stadium", kickoffAt: "2026-07-01T22:00:00" },
  { number: 83, stage: MatchStage.ROUND_32, homeLabel: "2K", awayLabel: "2L", stadium: "Toronto Stadium", kickoffAt: "2026-07-03T01:00:00" },
  { number: 84, stage: MatchStage.ROUND_32, homeLabel: "1H", awayLabel: "2J", stadium: "Los Angeles Stadium", kickoffAt: "2026-07-02T21:00:00" },
  { number: 85, stage: MatchStage.ROUND_32, homeLabel: "1B", awayLabel: "3EFGIJ", stadium: "Vancouver Stadium", kickoffAt: "2026-07-03T05:00:00" },
  { number: 86, stage: MatchStage.ROUND_32, homeLabel: "1J", awayLabel: "2H", stadium: "Miami Stadium", kickoffAt: "2026-07-04T00:00:00" },
  { number: 87, stage: MatchStage.ROUND_32, homeLabel: "1K", awayLabel: "3DEIJL", stadium: "Kansas City Stadium", kickoffAt: "2026-07-04T03:30:00" },
  { number: 88, stage: MatchStage.ROUND_32, homeLabel: "2D", awayLabel: "2G", stadium: "Dallas Stadium", kickoffAt: "2026-07-03T20:00:00" },
  { number: 89, stage: MatchStage.ROUND_16, homeLabel: "W74", awayLabel: "W77", stadium: "Philadelphia Stadium", kickoffAt: "2026-07-04T23:00:00" },
  { number: 90, stage: MatchStage.ROUND_16, homeLabel: "W73", awayLabel: "W75", stadium: "Houston Stadium", kickoffAt: "2026-07-04T19:00:00" },
  { number: 91, stage: MatchStage.ROUND_16, homeLabel: "W76", awayLabel: "W78", stadium: "New York New Jersey Stadium", kickoffAt: "2026-07-05T22:00:00" },
  { number: 92, stage: MatchStage.ROUND_16, homeLabel: "W79", awayLabel: "W80", stadium: "Mexico City Stadium", kickoffAt: "2026-07-06T02:00:00" },
  { number: 93, stage: MatchStage.ROUND_16, homeLabel: "W83", awayLabel: "W84", stadium: "Dallas Stadium", kickoffAt: "2026-07-06T21:00:00" },
  { number: 94, stage: MatchStage.ROUND_16, homeLabel: "W81", awayLabel: "W82", stadium: "Seattle Stadium", kickoffAt: "2026-07-07T02:00:00" },
  { number: 95, stage: MatchStage.ROUND_16, homeLabel: "W86", awayLabel: "W88", stadium: "Atlanta Stadium", kickoffAt: "2026-07-07T18:00:00" },
  { number: 96, stage: MatchStage.ROUND_16, homeLabel: "W85", awayLabel: "W87", stadium: "Vancouver Stadium", kickoffAt: "2026-07-07T22:00:00" },
  { number: 97, stage: MatchStage.QUARTER, homeLabel: "W89", awayLabel: "W90", stadium: "Boston Stadium", kickoffAt: "2026-07-09T22:00:00" },
  { number: 98, stage: MatchStage.QUARTER, homeLabel: "W93", awayLabel: "W94", stadium: "Los Angeles Stadium", kickoffAt: "2026-07-10T21:00:00" },
  { number: 99, stage: MatchStage.QUARTER, homeLabel: "W91", awayLabel: "W92", stadium: "Miami Stadium", kickoffAt: "2026-07-11T23:00:00" },
  { number: 100, stage: MatchStage.QUARTER, homeLabel: "W95", awayLabel: "W96", stadium: "Kansas City Stadium", kickoffAt: "2026-07-12T03:00:00" },
  { number: 101, stage: MatchStage.SEMI, homeLabel: "W97", awayLabel: "W98", stadium: "Dallas Stadium", kickoffAt: "2026-07-14T21:00:00" },
  { number: 102, stage: MatchStage.SEMI, homeLabel: "W99", awayLabel: "W100", stadium: "Atlanta Stadium", kickoffAt: "2026-07-15T21:00:00" },
  { number: 103, stage: MatchStage.THIRD_PLACE, homeLabel: "L101", awayLabel: "L102", stadium: "Miami Stadium", kickoffAt: "2026-07-18T23:00:00" },
  { number: 104, stage: MatchStage.FINAL, homeLabel: "W101", awayLabel: "W102", stadium: "New York New Jersey Stadium", kickoffAt: "2026-07-19T21:00:00" },
];
