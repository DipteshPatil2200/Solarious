CREATE TABLE `inquiries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kind` text NOT NULL,
	`name` text NOT NULL,
	`company` text DEFAULT '' NOT NULL,
	`email` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`product` text DEFAULT '' NOT NULL,
	`capacity` text DEFAULT '' NOT NULL,
	`location` text DEFAULT '' NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`details` text DEFAULT '{}' NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `product_overrides` (
	`slug` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`technology` text NOT NULL,
	`summary` text NOT NULL,
	`applications` text NOT NULL,
	`features` text NOT NULL,
	`bifacial` text NOT NULL,
	`image` text NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`updated_at` text NOT NULL
);
