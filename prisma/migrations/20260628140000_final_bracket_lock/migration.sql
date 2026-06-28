-- AlterTable
ALTER TABLE "User" ADD COLUMN "finalBracketLocked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "finalBracketLockedAt" DATETIME;
