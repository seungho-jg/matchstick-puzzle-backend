-- AlterTable
ALTER TABLE `User` ADD COLUMN `currentSkin` VARCHAR(191) NOT NULL DEFAULT 'default',
    ADD COLUMN `unlockedSkins` JSON NOT NULL;
