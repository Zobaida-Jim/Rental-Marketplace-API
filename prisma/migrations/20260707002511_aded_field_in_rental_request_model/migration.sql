/*
  Warnings:

  - Added the required column `message` to the `rentalRequests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "rentalRequests" ADD COLUMN     "message" TEXT NOT NULL;
