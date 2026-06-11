/*
  Warnings:

  - You are about to drop the column `label` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `matchOrder` on the `Match` table. All the data in the column will be lost.
  - Added the required column `matchNumber` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
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
    CONSTRAINT "Match_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Match" ("awayScore", "awayTeamId", "groupId", "homeScore", "homeTeamId", "id", "stage") SELECT "awayScore", "awayTeamId", "groupId", "homeScore", "homeTeamId", "id", "stage" FROM "Match";
DROP TABLE "Match";
ALTER TABLE "new_Match" RENAME TO "Match";
CREATE UNIQUE INDEX "Match_matchNumber_key" ON "Match"("matchNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
