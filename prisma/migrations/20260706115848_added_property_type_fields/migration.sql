/*
  Warnings:

  - Added the required column `propertyType` to the `properties` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "propertyType" TEXT NOT NULL;
