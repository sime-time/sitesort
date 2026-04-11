import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

const timestamps = () => ({
  created_at: timestamp({ withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
  updated_at: timestamp({ withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date().toISOString()),
});

export const jobs = pgTable(
  "jobs",
  {
    id: uuid().defaultRandom().primaryKey(),
    user_id: text().notNull().default(sql`auth.user_id ()`),
    name: text().notNull(),
    address: text().notNull(),
    start_date: timestamp({ withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    end_date: timestamp({ withTimezone: true, mode: "string" }),
    ...timestamps(),
  },
  (table) => [index("user_idx").on(table.user_id)],
);

export const job_materials = pgTable("job_materials", {
  id: uuid().defaultRandom().primaryKey(),
  job_id: uuid()
    .references(() => jobs.id)
    .notNull(),
  material_id: uuid()
    .references(() => materials.id)
    .notNull(),
  quantity: integer().default(0).notNull(),
  ...timestamps(),
});

export const materials = pgTable("materials", {
  id: uuid().defaultRandom().primaryKey(),
  category_id: uuid()
    .references(() => categories.id)
    .notNull(),
  name: text().notNull(),
  ...timestamps(),
});

export const categories = pgTable("categories", {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  order: integer().notNull(),
  ...timestamps(),
});

export const tasks = pgTable("tasks", {
  id: uuid().defaultRandom().primaryKey(),
  job_id: uuid()
    .references(() => jobs.id)
    .notNull(),
  description: text().notNull(),
  completed: boolean().default(false).notNull(),
  order: integer(),
  ...timestamps(),
});

// Types
export type InsertJob = typeof jobs.$inferInsert;
export type SelectJob = typeof jobs.$inferSelect;
export type InsertJobMaterial = typeof job_materials.$inferInsert;
export type SelectJobMaterial = typeof job_materials.$inferSelect;
export type InsertMaterial = typeof materials.$inferInsert;
export type SelectMaterial = typeof materials.$inferSelect;
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
export const taskSelectSchema = createSelectSchema(tasks);
