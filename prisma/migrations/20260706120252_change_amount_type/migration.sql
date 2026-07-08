/*
  Warnings:

  - You are about to alter the column `rentAmount` on the `properties` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "properties" ALTER COLUMN "rentAmount" SET DATA TYPE INTEGER;
