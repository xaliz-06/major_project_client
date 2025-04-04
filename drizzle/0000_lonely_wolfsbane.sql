CREATE TABLE `transcribe_table` (
	`id` text(24) PRIMARY KEY NOT NULL,
	`filename` text NOT NULL,
	`fileURL` integer NOT NULL,
	`type` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `transcribe_table_fileURL_unique` ON `transcribe_table` (`fileURL`);--> statement-breakpoint
CREATE INDEX `filename_idx` ON `transcribe_table` (`filename`);--> statement-breakpoint
CREATE UNIQUE INDEX `fileURL_idx` ON `transcribe_table` (`fileURL`);