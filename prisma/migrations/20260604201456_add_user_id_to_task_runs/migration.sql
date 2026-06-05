/*
  Warnings:

  - Added the required column `userId` to the `TaskRun` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TaskRun" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "TaskRun_userId_projectId_idx" ON "TaskRun"("userId", "projectId");
