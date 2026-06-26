-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Match" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchNumber" INTEGER NOT NULL,
    "stage" TEXT NOT NULL,
    "groupId" TEXT,
    "homeTeamId" TEXT,
    "awayTeamId" TEXT,
    "homeLabel" TEXT,
    "awayLabel" TEXT,
    "kickoffAt" DATETIME,
    "stadium" TEXT,
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "scorersHome" TEXT,
    "scorersAway" TEXT,
    "ownGoalsHome" TEXT,
    "ownGoalsAway" TEXT,
    "winnerTeamId" TEXT,
    "scoreManuallyEdited" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Match_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Match" ("awayLabel", "awayScore", "awayTeamId", "groupId", "homeLabel", "homeScore", "homeTeamId", "id", "kickoffAt", "matchNumber", "ownGoalsAway", "ownGoalsHome", "scorersAway", "scorersHome", "stadium", "stage", "winnerTeamId") SELECT "awayLabel", "awayScore", "awayTeamId", "groupId", "homeLabel", "homeScore", "homeTeamId", "id", "kickoffAt", "matchNumber", "ownGoalsAway", "ownGoalsHome", "scorersAway", "scorersHome", "stadium", "stage", "winnerTeamId" FROM "Match";
DROP TABLE "Match";
ALTER TABLE "new_Match" RENAME TO "Match";
CREATE UNIQUE INDEX "Match_matchNumber_key" ON "Match"("matchNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
