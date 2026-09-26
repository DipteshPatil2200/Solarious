CREATE TABLE `creative_brand_settings` (
	`id` integer PRIMARY KEY DEFAULT 1 NOT NULL,
	`company_name` text DEFAULT 'Solarious Energy' NOT NULL,
	`email` text DEFAULT 'info@solariousenergy.in' NOT NULL,
	`mobile` text DEFAULT '' NOT NULL,
	`website` text DEFAULT 'www.solariousenergy.in' NOT NULL,
	`default_cta` text DEFAULT 'Contact Us Today' NOT NULL,
	`logo_key` text,
	`logo_type` text,
	`show_email` integer DEFAULT true NOT NULL,
	`show_mobile` integer DEFAULT false NOT NULL,
	`show_website` integer DEFAULT true NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `creative_brand_settings` (`id`,`company_name`,`email`,`mobile`,`website`,`default_cta`,`show_email`,`show_mobile`,`show_website`,`updated_at`) VALUES (1,'Solarious Energy','info@solariousenergy.in','','www.solariousenergy.in','Contact Us Today',1,0,1,datetime('now'));
--> statement-breakpoint
CREATE TABLE `solar_creatives` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`creative_date` text NOT NULL,
	`theme` text NOT NULL,
	`headline` text NOT NULL,
	`caption` text NOT NULL,
	`image_key` text NOT NULL,
	`image_type` text DEFAULT 'image/svg+xml' NOT NULL,
	`image_size` integer NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `solar_creatives_creative_date_unique` ON `solar_creatives` (`creative_date`);--> statement-breakpoint
CREATE UNIQUE INDEX `solar_creatives_theme_unique` ON `solar_creatives` (`theme`);--> statement-breakpoint
CREATE UNIQUE INDEX `solar_creatives_headline_unique` ON `solar_creatives` (`headline`);--> statement-breakpoint
CREATE UNIQUE INDEX `solar_creatives_caption_unique` ON `solar_creatives` (`caption`);--> statement-breakpoint
CREATE INDEX `idx_solar_creatives_created_at` ON `solar_creatives` (`created_at`);
