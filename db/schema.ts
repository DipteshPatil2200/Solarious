import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const inquiries = sqliteTable("inquiries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  kind: text("kind").notNull(),
  name: text("name").notNull(),
  company: text("company").notNull().default(""),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  product: text("product").notNull().default(""),
  capacity: text("capacity").notNull().default(""),
  location: text("location").notNull().default(""),
  message: text("message").notNull().default(""),
  details: text("details").notNull().default("{}"),
  status: text("status").notNull().default("new"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  index("idx_inquiries_created_at").on(table.createdAt),
  index("idx_inquiries_status").on(table.status),
]);

export const productOverrides = sqliteTable("product_overrides", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  technology: text("technology").notNull(),
  summary: text("summary").notNull(),
  applications: text("applications").notNull(),
  features: text("features").notNull(),
  bifacial: text("bifacial").notNull(),
  image: text("image").notNull(),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  updatedAt: text("updated_at").notNull(),
});

export const resources = sqliteTable("resources", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  category: text("category").notNull(),
  product: text("product").notNull().default(""),
  fileKey: text("file_key").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  thumbnailKey: text("thumbnail_key"),
  published: integer("published", { mode: "boolean" }).notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  index("idx_resources_published_order").on(table.published, table.displayOrder),
  index("idx_resources_category").on(table.category),
]);

export const heroBanners = sqliteTable("hero_banners", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  imageKey: text("image_key"),
  imageUrl: text("image_url").notNull(),
  altText: text("alt_text").notNull(),
  headline: text("headline").notNull().default("Clean energy. Pure world."),
  supportingText: text("supporting_text").notNull().default(""),
  ctaLabel: text("cta_label").notNull().default("Explore products"),
  ctaHref: text("cta_href").notNull().default("/products"),
  published: integer("published", { mode: "boolean" }).notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [index("idx_hero_banners_published_order").on(table.published, table.displayOrder)]);
