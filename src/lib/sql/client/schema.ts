import { DrizzleAppSchema } from "@powersync/drizzle-driver";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const jobs = sqliteTable("jobs", {
  id: text("id").primaryKey().notNull(),
  user_id: text("user_id").notNull(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  start_date: text("start_date").notNull(),
  end_date: text("end_date"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const job_materials = sqliteTable("job_materials", {
  id: text("id").primaryKey().notNull(),
  job_id: text("job_id")
    .references(() => jobs.id)
    .notNull(),
  material_id: text("material_id")
    .references(() => materials.id)
    .notNull(),
  quantity: integer("quantity").default(0).notNull(),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const materials = sqliteTable("materials", {
  id: text("id").primaryKey().notNull(),
  category_id: text("category_id")
    .references(() => categories.id)
    .notNull(),
  name: text("name").notNull(),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  order: integer("order").notNull(),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey().notNull(),
  job_id: text("job_id")
    .references(() => jobs.id)
    .notNull(),
  description: text("description").notNull(),
  is_completed: integer("is_completed", { mode: "boolean" })
    .default(false)
    .notNull(),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export type InsertJob = typeof jobs.$inferInsert;
export type SelectJob = typeof jobs.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;
export type SelectCategory = typeof categories.$inferSelect;
export type InsertMaterial = typeof materials.$inferInsert;
export type SelectMaterial = typeof materials.$inferSelect;
export type InsertJobMaterial = typeof job_materials.$inferInsert;
export type SelectJobMaterial = typeof job_materials.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;
export type SelectTask = typeof tasks.$inferSelect;

export const drizzleSchema = { jobs, materials, tasks };

// Infer the PowerSync schema from your Drizzle schema
export const AppSchema = new DrizzleAppSchema(drizzleSchema);
