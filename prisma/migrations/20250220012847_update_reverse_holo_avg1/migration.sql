/*
  Warnings:

  - You are about to drop the column `reverseHolofoilPrice` on the `Card` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Card" DROP COLUMN "reverseHolofoilPrice",
ADD COLUMN     "reverseHoloAvg1" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
