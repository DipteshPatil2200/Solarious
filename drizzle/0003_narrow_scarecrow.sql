CREATE TABLE `hero_banners` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`image_key` text,
	`image_url` text NOT NULL,
	`alt_text` text NOT NULL,
	`headline` text DEFAULT 'Clean energy. Pure world.' NOT NULL,
	`supporting_text` text DEFAULT '' NOT NULL,
	`cta_label` text DEFAULT 'Explore products' NOT NULL,
	`cta_href` text DEFAULT '/products' NOT NULL,
	`published` integer DEFAULT false NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_hero_banners_published_order` ON `hero_banners` (`published`,`display_order`);