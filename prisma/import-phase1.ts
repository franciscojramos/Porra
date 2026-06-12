import { PrismaClient } from "@prisma/client";
import { syncFinalBracketFromKnockout } from "../src/lib/knockoutBracket";
import { recalculateAllScores } from "../src/lib/scoring";

const prisma = new PrismaClient();

type UserPhase1Data = {
  userId: string;
  standings: Record<string, [string, string, string, string]>;
  bestThirds: string[];
  matchScores: Record<number, [number, number]>;
};

const USERS: UserPhase1Data[] = [
  {
    userId: "cmqa71eqh0005xuou2brj9rt6",
    standings: {
      A: ["RSA", "MEX", "KOR", "CZE"],
      B: ["CAN", "BIH", "QAT", "SUI"],
      C: ["BRA", "MAR", "SCO", "HTI"],
      D: ["AUS", "PAR", "TUR", "USA"],
      E: ["ECU", "GER", "CUW", "CIV"],
      F: ["TUN", "NED", "SWE", "JPN"],
      G: ["NZL", "EGY", "BEL", "IRN"],
      H: ["ESP", "CPV", "URU", "KSA"],
      I: ["NOR", "FRA", "IRQ", "SEN"],
      J: ["ALG", "ARG", "JOR", "AUT"],
      K: ["UZB", "POR", "COD", "COL"],
      L: ["ENG", "GHA", "PAN", "CRO"],
    },
    bestThirds: ["JOR", "IRQ", "TUR", "SWE", "CUW", "KOR", "QAT", "BEL"],
    matchScores: {
      1: [1, 3], 2: [2, 0], 3: [4, 2], 4: [2, 1], 5: [1, 2], 6: [3, 1],
      7: [3, 1], 8: [3, 2], 9: [2, 3], 10: [3, 1], 11: [0, 0], 12: [2, 4],
      13: [2, 2], 14: [3, 2], 15: [1, 1], 16: [1, 2], 17: [2, 1], 18: [1, 2],
      19: [1, 2], 20: [1, 1], 21: [1, 0], 22: [2, 2], 23: [2, 1], 24: [3, 2],
      25: [0, 1], 26: [2, 0], 27: [1, 0], 28: [2, 1], 29: [2, 1], 30: [0, 1],
      31: [0, 0], 32: [1, 2], 33: [1, 1], 34: [2, 1], 35: [3, 2], 36: [2, 1],
      37: [2, 3], 38: [1, 0], 39: [3, 2], 40: [4, 2], 41: [1, 0], 42: [3, 3],
      43: [2, 2], 44: [2, 0], 45: [3, 2], 46: [2, 1], 47: [2, 2], 48: [0, 2],
      49: [1, 3], 50: [1, 1], 51: [0, 1], 52: [3, 2], 53: [2, 2], 54: [1, 0],
      55: [3, 0], 56: [1, 0], 57: [1, 4], 58: [0, 0], 59: [2, 1], 60: [2, 0],
      61: [2, 2], 62: [0, 1], 63: [1, 1], 64: [1, 0], 65: [0, 0], 66: [1, 1],
      67: [0, 1], 68: [1, 1], 69: [1, 1], 70: [0, 1], 71: [1, 1], 72: [2, 5],
    },
  },
  {
    userId: "cmq9q1j7b0001xux4ltvww1lj",
    standings: {
      A: ["KOR", "MEX", "CZE", "RSA"],
      B: ["SUI", "CAN", "BIH", "QAT"],
      C: ["BRA", "MAR", "SCO", "HTI"],
      D: ["TUR", "USA", "PAR", "AUS"],
      E: ["GER", "ECU", "CIV", "CUW"],
      F: ["NED", "SWE", "JPN", "TUN"],
      G: ["BEL", "EGY", "IRN", "NZL"],
      H: ["ESP", "URU", "KSA", "CPV"],
      I: ["FRA", "NOR", "SEN", "IRQ"],
      J: ["ARG", "ALG", "AUT", "JOR"],
      K: ["POR", "COL", "COD", "UZB"],
      L: ["ENG", "CRO", "GHA", "PAN"],
    },
    bestThirds: ["CIV", "CZE", "KSA", "BIH", "PAR", "AUT", "SEN", "SCO"],
    matchScores: {
      1: [3, 1], 2: [1, 0], 3: [1, 1], 4: [1, 0], 5: [0, 2], 6: [0, 2],
      7: [3, 0], 8: [0, 3], 9: [1, 1], 10: [5, 0], 11: [2, 1], 12: [2, 0],
      13: [1, 1], 14: [3, 0], 15: [2, 1], 16: [1, 0], 17: [2, 1], 18: [0, 2],
      19: [1, 0], 20: [2, 1], 21: [2, 0], 22: [2, 1], 23: [4, 0], 24: [0, 3],
      25: [2, 0], 26: [1, 0], 27: [3, 1], 28: [1, 1], 29: [4, 0], 30: [0, 1],
      31: [1, 1], 32: [3, 1], 33: [1, 1], 34: [2, 0], 35: [3, 2], 36: [1, 1],
      37: [4, 0], 38: [2, 0], 39: [1, 0], 40: [0, 1], 41: [1, 0], 42: [3, 0],
      43: [2, 0], 44: [0, 2], 45: [2, 0], 46: [0, 2], 47: [3, 0], 48: [2, 1],
      49: [1, 2], 50: [3, 0], 51: [3, 2], 52: [2, 1], 53: [0, 0], 54: [1, 2],
      55: [0, 1], 56: [2, 2], 57: [1, 2], 58: [1, 3], 59: [2, 0], 60: [1, 0],
      61: [1, 2], 62: [3, 0], 63: [2, 1], 64: [0, 3], 65: [1, 3], 66: [1, 2],
      67: [0, 4], 68: [1, 0], 69: [2, 2], 70: [0, 3], 71: [1, 2], 72: [1, 1],
    },
  },
  {
    userId: "cmqa74rum0006xuouj1w1uzxc",
    standings: {
      A: ["MEX", "KOR", "RSA", "CZE"],
      B: ["SUI", "CAN", "QAT", "BIH"],
      C: ["BRA", "MAR", "SCO", "HTI"],
      D: ["TUR", "USA", "AUS", "PAR"],
      E: ["GER", "ECU", "CIV", "CUW"],
      F: ["NED", "JPN", "SWE", "TUN"],
      G: ["BEL", "EGY", "IRN", "NZL"],
      H: ["ESP", "URU", "KSA", "CPV"],
      I: ["FRA", "NOR", "SEN", "IRQ"],
      J: ["ARG", "AUT", "ALG", "JOR"],
      K: ["POR", "COL", "UZB", "COD"],
      L: ["ENG", "GHA", "CRO", "PAN"],
    },
    bestThirds: ["RSA", "SCO", "CIV", "SWE", "SEN", "ALG", "UZB", "CRO"],
    matchScores: {
      1: [2, 1], 2: [2, 0], 3: [2, 1], 4: [1, 1], 5: [0, 3], 6: [1, 2],
      7: [0, 0], 8: [0, 2], 9: [2, 3], 10: [5, 0], 11: [1, 1], 12: [2, 0],
      13: [1, 3], 14: [5, 0], 15: [1, 0], 16: [1, 1], 17: [2, 2], 18: [1, 5],
      19: [3, 2], 20: [3, 1], 21: [2, 0], 22: [3, 1], 23: [7, 0], 24: [2, 2],
      25: [0, 1], 26: [5, 0], 27: [3, 0], 28: [1, 1], 29: [6, 0], 30: [1, 1],
      31: [4, 1], 32: [1, 0], 33: [1, 1], 34: [3, 0], 35: [3, 1], 36: [0, 2],
      37: [3, 0], 38: [3, 1], 39: [2, 0], 40: [0, 2], 41: [3, 3], 42: [5, 0],
      43: [2, 0], 44: [0, 2], 45: [2, 0], 46: [0, 1], 47: [1, 0], 48: [5, 0],
      49: [2, 3], 50: [2, 0], 51: [1, 0], 52: [0, 1], 53: [0, 4], 54: [2, 2],
      55: [1, 3], 56: [1, 2], 57: [2, 2], 58: [0, 4], 59: [1, 1], 60: [2, 3],
      61: [2, 2], 62: [3, 2], 63: [1, 0], 64: [1, 4], 65: [1, 2], 66: [1, 1],
      67: [0, 6], 68: [2, 2], 69: [1, 2], 70: [0, 3], 71: [0, 2], 72: [1, 3],
    },
  },
  {
    userId: "cmqa70peu0004xuousp7hysvw",
    standings: {
      A: ["CZE", "KOR", "RSA", "MEX"],
      B: ["SUI", "CAN", "BIH", "QAT"],
      C: ["BRA", "MAR", "SCO", "HTI"],
      D: ["TUR", "USA", "PAR", "AUS"],
      E: ["GER", "ECU", "CIV", "CUW"],
      F: ["NED", "SWE", "JPN", "TUN"],
      G: ["BEL", "EGY", "IRN", "NZL"],
      H: ["ESP", "URU", "KSA", "CPV"],
      I: ["FRA", "SEN", "NOR", "IRQ"],
      J: ["ARG", "AUT", "ALG", "JOR"],
      K: ["POR", "COL", "COD", "UZB"],
      L: ["ENG", "CRO", "GHA", "PAN"],
    },
    bestThirds: ["JPN", "NOR", "SCO", "ALG", "PAR", "CIV", "GHA", "BIH"],
    matchScores: {
      1: [1, 1], 2: [1, 2], 3: [2, 1], 4: [1, 1], 5: [0, 2], 6: [0, 3],
      7: [1, 1], 8: [0, 2], 9: [0, 1], 10: [5, 0], 11: [1, 1], 12: [3, 0],
      13: [0, 1], 14: [3, 0], 15: [0, 0], 16: [3, 1], 17: [1, 1], 18: [0, 3],
      19: [2, 0], 20: [3, 0], 21: [2, 0], 22: [2, 1], 23: [3, 0], 24: [0, 2],
      25: [2, 0], 26: [3, 1], 27: [2, 0], 28: [0, 1], 29: [4, 0], 30: [1, 1],
      31: [2, 0], 32: [3, 1], 33: [2, 1], 34: [3, 0], 35: [1, 1], 36: [0, 2],
      37: [2, 0], 38: [2, 0], 39: [3, 0], 40: [0, 2], 41: [2, 2], 42: [5, 0],
      43: [2, 1], 44: [0, 1], 45: [3, 1], 46: [0, 2], 47: [5, 0], 48: [2, 0],
      49: [1, 2], 50: [2, 0], 51: [1, 1], 52: [2, 1], 53: [3, 1], 54: [1, 1],
      55: [1, 3], 56: [1, 1], 57: [2, 2], 58: [0, 4], 59: [1, 1], 60: [1, 0],
      61: [2, 3], 62: [2, 1], 63: [2, 1], 64: [0, 6], 65: [1, 1], 66: [1, 2],
      67: [0, 6], 68: [2, 1], 69: [1, 1], 70: [0, 3], 71: [2, 2], 72: [1, 1],
    },
  },
  {
    userId: "cmqa6w4wi0000xuou8yneo6dn",
    standings: {
      A: ["CZE", "MEX", "KOR", "RSA"],
      B: ["CAN", "SUI", "BIH", "QAT"],
      C: ["BRA", "MAR", "SCO", "HTI"],
      D: ["TUR", "PAR", "AUS", "USA"],
      E: ["GER", "ECU", "CIV", "CUW"],
      F: ["NED", "SWE", "JPN", "TUN"],
      G: ["BEL", "NZL", "IRN", "EGY"],
      H: ["ESP", "URU", "KSA", "CPV"],
      I: ["FRA", "NOR", "IRQ", "SEN"],
      J: ["ARG", "AUT", "JOR", "ALG"],
      K: ["POR", "COL", "UZB", "COD"],
      L: ["ENG", "CRO", "PAN", "GHA"],
    },
    bestThirds: ["KOR", "BIH", "IRN", "SCO", "CIV", "JPN", "IRQ", "AUS"],
    matchScores: {
      1: [3, 0], 2: [1, 2], 3: [2, 1], 4: [1, 2], 5: [0, 2], 6: [1, 4],
      7: [2, 2], 8: [1, 3], 9: [2, 4], 10: [4, 0], 11: [2, 1], 12: [2, 0],
      13: [0, 4], 14: [6, 1], 15: [1, 2], 16: [2, 0], 17: [5, 0], 18: [2, 2],
      19: [3, 0], 20: [2, 0], 21: [1, 1], 22: [1, 0], 23: [1, 0], 24: [1, 2],
      25: [3, 0], 26: [1, 0], 27: [4, 2], 28: [1, 1], 29: [5, 1], 30: [1, 3],
      31: [2, 2], 32: [2, 2], 33: [5, 0], 34: [3, 1], 35: [1, 0], 36: [0, 0],
      37: [3, 2], 38: [4, 0], 39: [4, 1], 40: [1, 1], 41: [2, 0], 42: [3, 1],
      43: [2, 1], 44: [1, 1], 45: [2, 0], 46: [1, 3], 47: [2, 0], 48: [2, 0],
      49: [0, 2], 50: [3, 0], 51: [2, 3], 52: [3, 0], 53: [2, 2], 54: [0, 1],
      55: [1, 4], 56: [1, 3], 57: [2, 2], 58: [0, 6], 59: [3, 0], 60: [1, 1],
      61: [2, 4], 62: [0, 0], 63: [0, 3], 64: [1, 2], 65: [0, 1], 66: [2, 2],
      67: [2, 4], 68: [3, 0], 69: [1, 5], 70: [0, 4], 71: [1, 3], 72: [0, 0],
    },
  },
  {
    userId: "cmqa6z1rb0002xuoun9npbl1l",
    standings: {
      A: ["MEX", "CZE", "RSA", "KOR"],
      B: ["BIH", "SUI", "CAN", "QAT"],
      C: ["BRA", "MAR", "SCO", "HTI"],
      D: ["TUR", "PAR", "USA", "AUS"],
      E: ["GER", "CIV", "ECU", "CUW"],
      F: ["NED", "JPN", "SWE", "TUN"],
      G: ["BEL", "IRN", "EGY", "NZL"],
      H: ["ESP", "URU", "KSA", "CPV"],
      I: ["FRA", "SEN", "NOR", "IRQ"],
      J: ["AUT", "ARG", "ALG", "JOR"],
      K: ["POR", "COL", "COD", "UZB"],
      L: ["ENG", "CRO", "GHA", "PAN"],
    },
    bestThirds: ["CAN", "NOR", "SWE", "ECU", "GHA", "SCO", "KSA", "EGY"],
    matchScores: {
      1: [1, 1], 2: [0, 2], 3: [3, 3], 4: [1, 2], 5: [0, 2], 6: [1, 3],
      7: [2, 1], 8: [0, 4], 9: [2, 0], 10: [10, 1], 11: [4, 2], 12: [2, 1],
      13: [1, 3], 14: [8, 0], 15: [1, 0], 16: [3, 0], 17: [2, 1], 18: [0, 1],
      19: [1, 1], 20: [0, 0], 21: [2, 0], 22: [1, 0], 23: [4, 0], 24: [0, 2],
      25: [3, 0], 26: [1, 1], 27: [4, 1], 28: [2, 0], 29: [7, 1], 30: [0, 2],
      31: [3, 1], 32: [2, 2], 33: [3, 0], 34: [4, 0], 35: [2, 0], 36: [0, 3],
      37: [6, 1], 38: [3, 0], 39: [3, 0], 40: [0, 1], 41: [1, 1], 42: [3, 0],
      43: [0, 1], 44: [2, 2], 45: [3, 1], 46: [0, 4], 47: [6, 0], 48: [3, 1],
      49: [0, 1], 50: [5, 1], 51: [1, 1], 52: [4, 0], 53: [0, 2], 54: [2, 2],
      55: [0, 2], 56: [1, 3], 57: [1, 1], 58: [0, 5], 59: [2, 0], 60: [2, 0],
      61: [1, 3], 62: [2, 1], 63: [1, 2], 64: [0, 2], 65: [1, 3], 66: [1, 2],
      67: [0, 5], 68: [2, 1], 69: [1, 3], 70: [0, 2], 71: [1, 3], 72: [0, 0],
    },
  },
  {
    userId: "cmq9q0yqr0000xux4jivu0911",
    standings: {
      A: ["MEX", "CZE", "KOR", "RSA"],
      B: ["SUI", "BIH", "CAN", "QAT"],
      C: ["BRA", "MAR", "SCO", "HTI"],
      D: ["TUR", "USA", "AUS", "PAR"],
      E: ["GER", "ECU", "CIV", "CUW"],
      F: ["JPN", "NED", "SWE", "TUN"],
      G: ["BEL", "EGY", "IRN", "NZL"],
      H: ["ESP", "URU", "KSA", "CPV"],
      I: ["FRA", "NOR", "SEN", "IRQ"],
      J: ["ARG", "AUT", "ALG", "JOR"],
      K: ["POR", "COL", "COD", "UZB"],
      L: ["ENG", "GHA", "CRO", "PAN"],
    },
    bestThirds: ["SCO", "CAN", "CIV", "ALG", "KOR", "SEN", "AUS", "CRO"],
    matchScores: {
      1: [1, 0], 2: [1, 1], 3: [1, 1], 4: [2, 0], 5: [0, 4], 6: [0, 2],
      7: [2, 1], 8: [0, 3], 9: [0, 0], 10: [5, 0], 11: [1, 2], 12: [1, 0],
      13: [0, 2], 14: [6, 0], 15: [1, 1], 16: [2, 0], 17: [4, 1], 18: [0, 3],
      19: [2, 1], 20: [2, 0], 21: [2, 0], 22: [3, 1], 23: [3, 0], 24: [0, 2],
      25: [2, 1], 26: [1, 1], 27: [2, 0], 28: [2, 1], 29: [5, 0], 30: [1, 3],
      31: [2, 0], 32: [1, 1], 33: [2, 1], 34: [3, 0], 35: [2, 0], 36: [0, 1],
      37: [3, 0], 38: [3, 1], 39: [2, 0], 40: [1, 2], 41: [1, 1], 42: [4, 0],
      43: [2, 1], 44: [1, 2], 45: [3, 1], 46: [0, 1], 47: [2, 0], 48: [2, 1],
      49: [1, 1], 50: [4, 0], 51: [2, 1], 52: [3, 1], 53: [1, 2], 54: [1, 2],
      55: [1, 3], 56: [1, 2], 57: [1, 1], 58: [1, 3], 59: [3, 1], 60: [1, 2],
      61: [1, 3], 62: [3, 1], 63: [1, 1], 64: [0, 3], 65: [0, 2], 66: [1, 3],
      67: [0, 2], 68: [1, 1], 69: [2, 2], 70: [0, 2], 71: [0, 3], 72: [1, 0],
    },
  },
  {
    userId: "cmqa6zxux0003xuouc6gyzkor",
    standings: {
      A: ["MEX", "KOR", "RSA", "CZE"],
      B: ["SUI", "QAT", "CAN", "BIH"],
      C: ["BRA", "MAR", "SCO", "HTI"],
      D: ["USA", "AUS", "PAR", "TUR"],
      E: ["GER", "ECU", "CIV", "CUW"],
      F: ["SWE", "JPN", "TUN", "NED"],
      G: ["NZL", "BEL", "EGY", "IRN"],
      H: ["ESP", "CPV", "URU", "KSA"],
      I: ["FRA", "NOR", "SEN", "IRQ"],
      J: ["ARG", "AUT", "JOR", "ALG"],
      K: ["POR", "COL", "COD", "UZB"],
      L: ["GHA", "ENG", "CRO", "PAN"],
    },
    bestThirds: ["EGY", "SEN", "SCO", "URU", "CRO", "CAN", "TUN", "COD"],
    matchScores: {
      1: [2, 0], 2: [2, 1], 3: [3, 0], 4: [4, 1], 5: [0, 3], 6: [2, 0],
      7: [3, 0], 8: [1, 1], 9: [1, 1], 10: [3, 0], 11: [0, 3], 12: [2, 1],
      13: [1, 1], 14: [3, 0], 15: [1, 4], 16: [3, 1], 17: [3, 2], 18: [1, 1],
      19: [3, 0], 20: [1, 1], 21: [1, 3], 22: [3, 2], 23: [3, 0], 24: [0, 3],
      25: [0, 1], 26: [3, 0], 27: [0, 3], 28: [3, 1], 29: [4, 0], 30: [0, 1],
      31: [0, 2], 32: [3, 1], 33: [2, 0], 34: [2, 1], 35: [1, 1], 36: [1, 3],
      37: [1, 1], 38: [2, 1], 39: [4, 2], 40: [2, 2], 41: [3, 2], 42: [2, 0],
      43: [2, 1], 44: [0, 0], 45: [0, 1], 46: [1, 2], 47: [2, 0], 48: [2, 1],
      49: [0, 2], 50: [2, 1], 51: [2, 1], 52: [0, 1], 53: [0, 2], 54: [0, 3],
      55: [0, 0], 56: [1, 3], 57: [2, 3], 58: [2, 1], 59: [1, 2], 60: [0, 3],
      61: [1, 2], 62: [2, 0], 63: [3, 1], 64: [2, 1], 65: [2, 1], 66: [1, 1],
      67: [0, 4], 68: [1, 2], 69: [1, 1], 70: [0, 2], 71: [2, 3], 72: [1, 0],
    },
  },
  {
    userId: "cmqa75ado0007xuouttxh6235",
    standings: {
      A: ["KOR", "MEX", "CZE", "RSA"],
      B: ["CAN", "SUI", "BIH", "QAT"],
      C: ["MAR", "BRA", "SCO", "HTI"],
      D: ["TUR", "PAR", "USA", "AUS"],
      E: ["ECU", "GER", "CIV", "CUW"],
      F: ["JPN", "NED", "SWE", "TUN"],
      G: ["BEL", "EGY", "IRN", "NZL"],
      H: ["ESP", "URU", "KSA", "CPV"],
      I: ["SEN", "FRA", "NOR", "IRQ"],
      J: ["ARG", "ALG", "AUT", "JOR"],
      K: ["POR", "COL", "COD", "UZB"],
      L: ["ENG", "GHA", "CRO", "PAN"],
    },
    bestThirds: ["USA", "AUT", "CRO", "CZE", "CIV", "NOR", "SWE", "SCO"],
    matchScores: {
      1: [2, 1], 2: [0, 0], 3: [2, 1], 4: [1, 1], 5: [0, 2], 6: [0, 3],
      7: [1, 2], 8: [0, 1], 9: [1, 2], 10: [6, 0], 11: [2, 2], 12: [3, 1],
      13: [0, 1], 14: [6, 0], 15: [0, 0], 16: [2, 1], 17: [0, 1], 18: [0, 3],
      19: [2, 1], 20: [2, 0], 21: [2, 0], 22: [1, 0], 23: [5, 0], 24: [0, 3],
      25: [1, 0], 26: [1, 0], 27: [2, 1], 28: [1, 2], 29: [5, 0], 30: [1, 2],
      31: [1, 1], 32: [2, 0], 33: [2, 1], 34: [3, 0], 35: [1, 0], 36: [0, 3],
      37: [2, 0], 38: [4, 0], 39: [1, 0], 40: [0, 2], 41: [1, 2], 42: [7, 0],
      43: [2, 0], 44: [0, 2], 45: [1, 0], 46: [0, 1], 47: [2, 0], 48: [4, 1],
      49: [1, 2], 50: [3, 0], 51: [1, 1], 52: [1, 0], 53: [0, 1], 54: [0, 2],
      55: [0, 3], 56: [1, 0], 57: [3, 2], 58: [0, 2], 59: [2, 1], 60: [2, 0],
      61: [1, 2], 62: [2, 1], 63: [1, 1], 64: [0, 2], 65: [0, 3], 66: [0, 2],
      67: [1, 4], 68: [1, 1], 69: [1, 1], 70: [0, 5], 71: [2, 2], 72: [1, 0],
    },
  },
];

async function importUserPhase1(
  data: UserPhase1Data,
  teamByCode: Record<string, string>
) {
  const user = await prisma.user.findUnique({ where: { id: data.userId } });
  if (!user) throw new Error(`Usuario no encontrado: ${data.userId}`);

  for (const [groupId, [first, second, third, fourth]] of Object.entries(data.standings)) {
    const ids = [first, second, third, fourth].map((c) => teamByCode[c]);
    if (ids.some((id) => !id)) {
      throw new Error(`${user.username}: equipo no encontrado en grupo ${groupId}`);
    }

    await prisma.groupStandingPrediction.upsert({
      where: { userId_groupId: { userId: data.userId, groupId } },
      create: {
        userId: data.userId,
        groupId,
        firstTeamId: ids[0]!,
        secondTeamId: ids[1]!,
        thirdTeamId: ids[2]!,
        fourthTeamId: ids[3]!,
      },
      update: {
        firstTeamId: ids[0]!,
        secondTeamId: ids[1]!,
        thirdTeamId: ids[2]!,
        fourthTeamId: ids[3]!,
        points: 0,
      },
    });
  }

  const standingRows = await prisma.groupStandingPrediction.findMany({
    where: { userId: data.userId },
    select: { thirdTeamId: true },
  });
  const allowedThirdIds = new Set(standingRows.map((s) => s.thirdTeamId));
  const thirdIds = data.bestThirds.map((c) => teamByCode[c]);

  if (thirdIds.some((id) => !id) || new Set(data.bestThirds).size !== 8) {
    throw new Error(`${user.username}: 8 terceros inválidos`);
  }
  if (data.bestThirds.some((code) => !allowedThirdIds.has(teamByCode[code]!))) {
    throw new Error(`${user.username}: terceros no coinciden con clasificación`);
  }

  await prisma.bestThirdPrediction.deleteMany({ where: { userId: data.userId } });
  await prisma.bestThirdPrediction.createMany({
    data: thirdIds.map((teamId) => ({ userId: data.userId, teamId: teamId! })),
  });

  const groupMatches = await prisma.match.findMany({
    where: { stage: "GROUP" },
    select: { id: true, matchNumber: true },
  });

  for (const match of groupMatches) {
    const scores = data.matchScores[match.matchNumber];
    if (!scores) continue;

    await prisma.matchPrediction.upsert({
      where: { userId_matchId: { userId: data.userId, matchId: match.id } },
      create: {
        userId: data.userId,
        matchId: match.id,
        homeScore: scores[0],
        awayScore: scores[1],
        points: 0,
      },
      update: { homeScore: scores[0], awayScore: scores[1], points: 0 },
    });
  }

  await syncFinalBracketFromKnockout(data.userId).catch(() => null);

  const counts = await Promise.all([
    prisma.matchPrediction.count({
      where: { userId: data.userId, match: { stage: "GROUP" } },
    }),
    prisma.groupStandingPrediction.count({ where: { userId: data.userId } }),
    prisma.bestThirdPrediction.count({ where: { userId: data.userId } }),
  ]);

  console.log(`✓ ${user.username} (${user.displayName})`);
  console.log(`    Partidos: ${counts[0]}/72 · Grupos: ${counts[1]}/12 · Terceros: ${counts[2]}/8`);
}

async function main() {
  const filter = process.argv[2];
  const teams = await prisma.team.findMany();
  const teamByCode = Object.fromEntries(teams.map((t) => [t.code, t.id]));

  let targets = USERS;
  if (filter) {
    const byId = USERS.find((u) => u.userId === filter);
    if (byId) {
      targets = [byId];
    } else {
      const user = await prisma.user.findFirst({
        where: { OR: [{ username: filter }, { id: filter }] },
      });
      const match = user ? USERS.find((u) => u.userId === user.id) : undefined;
      if (!match) throw new Error(`No hay datos importados para: ${filter}`);
      targets = [match];
    }
  }

  for (const data of targets) {
    await importUserPhase1(data, teamByCode);
  }

  await recalculateAllScores();
  console.log("✓ Puntuación recalculada");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
