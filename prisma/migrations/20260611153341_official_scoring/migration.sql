-- CreateTable
CREATE TABLE "FinalBracketPrediction" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "championTeamId" TEXT,
    "runnerUpTeamId" TEXT,
    "thirdPlaceTeamId" TEXT,
    "fourthPlaceTeamId" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "FinalBracketPrediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OfficialFinalBracket" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "championTeamId" TEXT,
    "runnerUpTeamId" TEXT,
    "thirdPlaceTeamId" TEXT,
    "fourthPlaceTeamId" TEXT
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserScore" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "matchPoints" INTEGER NOT NULL DEFAULT 0,
    "standingPoints" INTEGER NOT NULL DEFAULT 0,
    "bestThirdPoints" INTEGER NOT NULL DEFAULT 0,
    "awardPoints" INTEGER NOT NULL DEFAULT 0,
    "bracketPoints" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "UserScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UserScore" ("awardPoints", "bestThirdPoints", "matchPoints", "standingPoints", "totalPoints", "userId") SELECT "awardPoints", "bestThirdPoints", "matchPoints", "standingPoints", "totalPoints", "userId" FROM "UserScore";
DROP TABLE "UserScore";
ALTER TABLE "new_UserScore" RENAME TO "UserScore";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
