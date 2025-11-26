-- Migration: Add rating column to Comment table
ALTER TABLE `Comment` ADD COLUMN `rating` int NULL AFTER `content`;

