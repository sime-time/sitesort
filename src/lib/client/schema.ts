import { DrizzleAppSchema } from "@powersync/drizzle-driver";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const jobs = sqliteTable("jobs", {
  id: text().primaryKey().notNull(),
  user_id: text().notNull(),
  name: text().notNull(),
  address: text().notNull(),
  start_date: text().notNull(),
  end_date: text(),
  completed: integer({ mode: "boolean" }).default(false).notNull(),
  created_at: text().notNull(),
  updated_at: text().notNull(),
});

export const job_materials = sqliteTable("job_materials", {
  id: text().primaryKey().notNull(),
  job_id: text()
    .references(() => jobs.id)
    .notNull(),
  material_id: text()
    .references(() => materials.id)
    .notNull(),
  quantity: integer().default(0).notNull(),
  created_at: text().notNull(),
  updated_at: text().notNull(),
});

export const materials = sqliteTable("materials", {
  id: text().primaryKey().notNull(),
  category_id: text()
    .references(() => categories.id)
    .notNull(),
  name: text().notNull(),
  created_at: text().notNull(),
  updated_at: text().notNull(),
});

export const categories = sqliteTable("categories", {
  id: text().primaryKey().notNull(),
  name: text().notNull(),
  order: integer().notNull(),
  created_at: text().notNull(),
  updated_at: text().notNull(),
});

export const tasks = sqliteTable("tasks", {
  id: text().primaryKey().notNull(),
  job_id: text()
    .references(() => jobs.id)
    .notNull(),
  order: integer(),
  description: text().notNull(),
  completed: integer({ mode: "boolean" }).default(false).notNull(),
  created_at: text().notNull(),
  updated_at: text().notNull(),
});

export const time_entries = sqliteTable("time_entries", {
  id: text().primaryKey().notNull(),
  user_id: text().notNull(),
  clock_in: text().notNull(),
  clock_out: text(),
  created_at: text().notNull(),
  updated_at: text().notNull(),
});

export const drizzleSchema = {
  jobs,
  materials,
  tasks,
  job_materials,
  categories,
  time_entries,
};

// Infer the PowerSync schema from your Drizzle schema
export const AppSchema = new DrizzleAppSchema(drizzleSchema);

// Types
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

// Zod Validation Schemas
export const jobInsertSchema = createInsertSchema(jobs);
export const jobSelectSchema = createSelectSchema(jobs);
export const jobMaterialInsertSchema = createInsertSchema(job_materials);
export const jobMaterialSelectSchema = createSelectSchema(job_materials);
export const materialInsertSchema = createInsertSchema(materials);
export const materialSelectSchema = createSelectSchema(materials);
export const taskInsertSchema = createInsertSchema(tasks);
