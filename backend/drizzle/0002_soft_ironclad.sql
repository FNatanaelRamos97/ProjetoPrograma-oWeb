CREATE TABLE `cancellation_requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`appointment_id` integer NOT NULL,
	`client_id` integer NOT NULL,
	`reason` text NOT NULL,
	`status` text DEFAULT 'pendente' NOT NULL,
	`admin_note` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`decided_at` text,
	FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`client_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
