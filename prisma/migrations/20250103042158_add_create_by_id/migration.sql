/*
  Warnings:

  - You are about to drop the column `createBy` on the `Puzzle` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Puzzle` DROP COLUMN `createBy`,
    ADD COLUMN `createById` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Puzzle` ADD CONSTRAINT `Puzzle_createById_fkey` FOREIGN KEY (`createById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
