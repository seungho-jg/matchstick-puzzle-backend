-- AlterTable
ALTER TABLE `User` ADD COLUMN `createCount` INTEGER NOT NULL DEFAULT 3,
    ADD COLUMN `membership` BOOLEAN NOT NULL DEFAULT false;
