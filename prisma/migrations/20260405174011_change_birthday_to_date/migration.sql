/*
  Warnings:

  - The `cumpleanios` column on the `Cliente` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Cliente" DROP COLUMN "cumpleanios",
ADD COLUMN     "cumpleanios" TIMESTAMP(3);
