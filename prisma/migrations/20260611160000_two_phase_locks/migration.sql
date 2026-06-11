-- Rename phase 1 lock fields and add phase 2 lock
ALTER TABLE "User" RENAME COLUMN "predictionsLocked" TO "phase1Locked";
ALTER TABLE "User" RENAME COLUMN "predictionsLockedAt" TO "phase1LockedAt";
ALTER TABLE "User" ADD COLUMN "phase2Locked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "phase2LockedAt" DATETIME;
