/*
  Warnings:

  - Added the required column `position` to the `GroupTeam` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GroupTeam" (
    "groupId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    PRIMARY KEY ("groupId", "teamId"),
    CONSTRAINT "GroupTeam_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GroupTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_GroupTeam" ("groupId", "teamId") SELECT "groupId", "teamId" FROM "GroupTeam";
DROP TABLE "GroupTeam";
ALTER TABLE "new_GroupTeam" RENAME TO "GroupTeam";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
