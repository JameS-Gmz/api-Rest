CREATE TABLE `Carts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quantity` int,
	`UserId` int,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `Carts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Comment` (
	`id` int AUTO_INCREMENT NOT NULL,
	`UserId` int NOT NULL,
	`GameId` int NOT NULL,
	`content` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `Comment_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Controllers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	CONSTRAINT `Controllers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `GameCart` (
	`CartId` int NOT NULL,
	`GameId` int NOT NULL,
	CONSTRAINT `GameCart_CartId_GameId_pk` PRIMARY KEY(`CartId`,`GameId`)
);
--> statement-breakpoint
CREATE TABLE `GameControllers` (
	`GameId` int NOT NULL,
	`ControllerId` int NOT NULL,
	CONSTRAINT `GameControllers_GameId_ControllerId_pk` PRIMARY KEY(`GameId`,`ControllerId`)
);
--> statement-breakpoint
CREATE TABLE `GameGenres` (
	`GameId` int NOT NULL,
	`GenreId` int NOT NULL,
	CONSTRAINT `GameGenres_GameId_GenreId_pk` PRIMARY KEY(`GameId`,`GenreId`)
);
--> statement-breakpoint
CREATE TABLE `GamePlatforms` (
	`GameId` int NOT NULL,
	`PlatformId` int NOT NULL,
	CONSTRAINT `GamePlatforms_GameId_PlatformId_pk` PRIMARY KEY(`GameId`,`PlatformId`)
);
--> statement-breakpoint
CREATE TABLE `GameTags` (
	`GameId` int NOT NULL,
	`TagId` int NOT NULL,
	CONSTRAINT `GameTags_GameId_TagId_pk` PRIMARY KEY(`GameId`,`TagId`)
);
--> statement-breakpoint
CREATE TABLE `Games` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(100) NOT NULL,
	`price` double NOT NULL DEFAULT 0,
	`authorStudio` varchar(255),
	`madewith` varchar(255),
	`description` varchar(1500),
	`StatusId` int,
	`LanguageId` int,
	`UserId` int,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `Games_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Genres` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` varchar(50) NOT NULL,
	CONSTRAINT `Genres_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Languages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100),
	`description` varchar(500),
	CONSTRAINT `Languages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Library` (
	`UserId` int NOT NULL,
	`GameId` int NOT NULL,
	`addedAt` timestamp DEFAULT (now()),
	CONSTRAINT `Library_UserId_GameId_pk` PRIMARY KEY(`UserId`,`GameId`)
);
--> statement-breakpoint
CREATE TABLE `Order` (
	`id` int AUTO_INCREMENT NOT NULL,
	`UserId` int NOT NULL,
	`GameId` int NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `Order_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Platforms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100),
	`description` varchar(500),
	CONSTRAINT `Platforms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL DEFAULT 'Default Role Name',
	`description` varchar(255),
	CONSTRAINT `Roles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Statuses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100),
	`description` varchar(500),
	CONSTRAINT `Statuses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100),
	`description` varchar(600),
	CONSTRAINT `Tags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Upload` (
	`id` int AUTO_INCREMENT NOT NULL,
	`UserId` int NOT NULL,
	`GameId` int NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `Upload_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(50) NOT NULL,
	`email` varchar(50) NOT NULL,
	`password` varchar(255) NOT NULL,
	`bio` varchar(100),
	`avatar` varchar(255),
	`birthday` datetime,
	`RoleId` int,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `Users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `UserId_idx` ON `Carts` (`UserId`);--> statement-breakpoint
CREATE INDEX `UserId_idx` ON `Comment` (`UserId`);--> statement-breakpoint
CREATE INDEX `GameId_idx` ON `Comment` (`GameId`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `Controllers` (`name`);--> statement-breakpoint
CREATE INDEX `CartId_idx` ON `GameCart` (`CartId`);--> statement-breakpoint
CREATE INDEX `GameId_idx` ON `GameCart` (`GameId`);--> statement-breakpoint
CREATE INDEX `GameId_idx` ON `GameControllers` (`GameId`);--> statement-breakpoint
CREATE INDEX `ControllerId_idx` ON `GameControllers` (`ControllerId`);--> statement-breakpoint
CREATE INDEX `GameId_idx` ON `GameGenres` (`GameId`);--> statement-breakpoint
CREATE INDEX `GenreId_idx` ON `GameGenres` (`GenreId`);--> statement-breakpoint
CREATE INDEX `GameId_idx` ON `GamePlatforms` (`GameId`);--> statement-breakpoint
CREATE INDEX `PlatformId_idx` ON `GamePlatforms` (`PlatformId`);--> statement-breakpoint
CREATE INDEX `GameId_idx` ON `GameTags` (`GameId`);--> statement-breakpoint
CREATE INDEX `TagId_idx` ON `GameTags` (`TagId`);--> statement-breakpoint
CREATE INDEX `title_idx` ON `Games` (`title`);--> statement-breakpoint
CREATE INDEX `StatusId_idx` ON `Games` (`StatusId`);--> statement-breakpoint
CREATE INDEX `LanguageId_idx` ON `Games` (`LanguageId`);--> statement-breakpoint
CREATE INDEX `UserId_idx` ON `Games` (`UserId`);--> statement-breakpoint
CREATE INDEX `price_idx` ON `Games` (`price`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `Genres` (`name`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `Languages` (`name`);--> statement-breakpoint
CREATE INDEX `UserId_idx` ON `Library` (`UserId`);--> statement-breakpoint
CREATE INDEX `GameId_idx` ON `Library` (`GameId`);--> statement-breakpoint
CREATE INDEX `UserId_idx` ON `Order` (`UserId`);--> statement-breakpoint
CREATE INDEX `GameId_idx` ON `Order` (`GameId`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `Platforms` (`name`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `Roles` (`name`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `Statuses` (`name`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `Tags` (`name`);--> statement-breakpoint
CREATE INDEX `UserId_idx` ON `Upload` (`UserId`);--> statement-breakpoint
CREATE INDEX `GameId_idx` ON `Upload` (`GameId`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `Users` (`email`);--> statement-breakpoint
CREATE INDEX `RoleId_idx` ON `Users` (`RoleId`);