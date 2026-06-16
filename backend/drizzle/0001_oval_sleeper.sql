CREATE TABLE `provider_availability_overrides` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`provider_id` integer NOT NULL,
	`specific_date` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`slot_duration` integer DEFAULT 60 NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `avail_overrides_provider_date_unique` ON `provider_availability_overrides` (`provider_id`,`specific_date`);--> statement-breakpoint
CREATE TABLE `provider_unavailable_slots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`provider_id` integer NOT NULL,
	`unavailable_date` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`reason` text DEFAULT 'Indisponível' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
DROP INDEX `appointments_provider_date_unique`;--> statement-breakpoint
ALTER TABLE `appointments` ADD `appointment_time` text DEFAULT '00:00' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `appointments_provider_datetime_unique` ON `appointments` (`provider_id`,`appointment_date`,`appointment_time`);--> statement-breakpoint
ALTER TABLE `provider_availability` ADD `slot_duration` integer DEFAULT 60 NOT NULL;