/*
  Warnings:

  - You are about to drop the column `createdBy` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `propertyType` on the `properties` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "properties" DROP COLUMN "createdBy",
DROP COLUMN "propertyType";
