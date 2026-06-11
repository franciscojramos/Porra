-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "GroupTeam" (
    "groupId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,

    PRIMARY KEY ("groupId", "teamId"),
    CONSTRAINT "GroupTeam_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GroupTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stage" TEXT NOT NULL,
    "groupId" TEXT,
    "homeTeamId" TEXT NOT NULL,
    "awayTeamId" TEXT NOT NULL,
    "matchOrder" INTEGER NOT NULL,
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "label" TEXT,
    CONSTRAINT "Match_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MatchPrediction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "homeScore" INTEGER NOT NULL,
    "awayScore" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "MatchPrediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MatchPrediction_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GroupStandingPrediction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "firstTeamId" TEXT NOT NULL,
    "secondTeamId" TEXT NOT NULL,
    "thirdTeamId" TEXT NOT NULL,
    "fourthTeamId" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "GroupStandingPrediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BestThirdPrediction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "BestThirdPrediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AwardPrediction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "first" TEXT,
    "second" TEXT,
    "third" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "AwardPrediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OfficialGroupStanding" (
    "groupId" TEXT NOT NULL PRIMARY KEY,
    "firstTeamId" TEXT NOT NULL,
    "secondTeamId" TEXT NOT NULL,
    "thirdTeamId" TEXT NOT NULL,
    "fourthTeamId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "OfficialBestThird" (
    "teamId" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "OfficialAward" (
    "category" TEXT NOT NULL PRIMARY KEY,
    "first" TEXT,
    "second" TEXT,
    "third" TEXT
);

-- CreateTable
CREATE TABLE "ScoringConfig" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "points" INTEGER NOT NULL,
    "label" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "UserScore" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "matchPoints" INTEGER NOT NULL DEFAULT 0,
    "standingPoints" INTEGER NOT NULL DEFAULT 0,
    "bestThirdPoints" INTEGER NOT NULL DEFAULT 0,
    "awardPoints" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "UserScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Team_code_key" ON "Team"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Group_name_key" ON "Group"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MatchPrediction_userId_matchId_key" ON "MatchPrediction"("userId", "matchId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupStandingPrediction_userId_groupId_key" ON "GroupStandingPrediction"("userId", "groupId");

-- CreateIndex
CREATE UNIQUE INDEX "BestThirdPrediction_userId_teamId_key" ON "BestThirdPrediction"("userId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "AwardPrediction_userId_category_key" ON "AwardPrediction"("userId", "category");
