/*
  Warnings:

  - You are about to drop the `TemplateExercise` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkoutTemplate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TemplateExercise" DROP CONSTRAINT "TemplateExercise_exerciseId_fkey";

-- DropForeignKey
ALTER TABLE "TemplateExercise" DROP CONSTRAINT "TemplateExercise_templateId_fkey";

-- DropForeignKey
ALTER TABLE "WorkoutTemplate" DROP CONSTRAINT "WorkoutTemplate_userId_fkey";

-- DropTable
DROP TABLE "TemplateExercise";

-- DropTable
DROP TABLE "WorkoutTemplate";

-- CreateTable
CREATE TABLE "MiniGameScore" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "game" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MiniGameScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MiniGameScore_game_score_idx" ON "MiniGameScore"("game", "score");

-- CreateIndex
CREATE INDEX "MiniGameScore_userId_idx" ON "MiniGameScore"("userId");

-- AddForeignKey
ALTER TABLE "MiniGameScore" ADD CONSTRAINT "MiniGameScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
