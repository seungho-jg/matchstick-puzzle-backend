-- AlterTable
ALTER TABLE `User` ADD COLUMN `hintCount` INTEGER NOT NULL DEFAULT 3,
    ADD COLUMN `lastHintChanrgeAt` DATETIME(3) NULL;