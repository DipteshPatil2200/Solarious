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
