ALTER TABLE `payments` ADD COLUMN `gateway` text DEFAULT 'stripe' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `payments_stripe_session_unique` ON `payments` (`stripe_checkout_session_id`);
