/*
  Warnings:

  - Made the column `createById` on table `Puzzle` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Puzzle` DROP FOREIGN KEY `Puzzle_createById_fkey`;

-- AlterTable
ALTER TABLE `Puzzle` MODIFY `createById` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Puzzle` ADD CONSTRAINT `Puzzle_createById_fkey` FOREIGN KEY (`createById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
