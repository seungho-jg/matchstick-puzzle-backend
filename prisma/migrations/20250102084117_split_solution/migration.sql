/*
  Warnings:

  - You are about to drop the column `solution` on the `Puzzle` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Puzzle` DROP COLUMN `solution`;

-- CreateTable
CREATE TABLE `Solution` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `puzzleId` INTEGER NOT NULL,
    `answer` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Solution` ADD CONSTRAINT `Solution_puzzleId_fkey` FOREIGN KEY (`puzzleId`) REFERENCES `Puzzle`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
