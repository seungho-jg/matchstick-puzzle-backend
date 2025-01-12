-- DropForeignKey
ALTER TABLE `Comment` DROP FOREIGN KEY `Comment_puzzleId_fkey`;

-- DropForeignKey
ALTER TABLE `Comment` DROP FOREIGN KEY `Comment_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Like` DROP FOREIGN KEY `Like_puzzleId_fkey`;

-- DropForeignKey
ALTER TABLE `Like` DROP FOREIGN KEY `Like_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Solution` DROP FOREIGN KEY `Solution_puzzleId_fkey`;

-- AddForeignKey
ALTER TABLE `Solution` ADD CONSTRAINT `Solution_puzzleId_fkey` FOREIGN KEY (`puzzleId`) REFERENCES `Puzzle`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Like` ADD CONSTRAINT `Like_puzzleId_fkey` FOREIGN KEY (`puzzleId`) REFERENCES `Puzzle`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Like` ADD CONSTRAINT `Like_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_puzzleId_fkey` FOREIGN KEY (`puzzleId`) REFERENCES `Puzzle`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
