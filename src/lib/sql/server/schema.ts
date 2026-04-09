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
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date().toISOString()),
});

export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: text("user_id").notNull().default(sql`auth.user_id ()`),
    name: text("name").notNull(),
    address: text("address").notNull(),
    start_date: timestamp("start_date", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    end_date: timestamp("end_date", { withTimezone: true, mode: "string" }),
    ...timestamps(),
  },
  (table) => [index("user_idx").on(table.user_id)],
);

export const job_materials = pgTable("job_materials", {
  id: uuid("id").defaultRandom().primaryKey(),
  job_id: uuid("job_id")
    .references(() => jobs.id)
    .notNull(),
  material_id: uuid("material_id")
    .references(() => materials.id)
    .notNull(),
  quantity: integer("quantity").default(0).notNull(),
  ...timestamps(),
});

export const materials = pgTable("materials", {
  id: uuid("id").defaultRandom().primaryKey(),
  category_id: uuid("category_id")
    .references(() => categories.id)
    .notNull(),
  name: text("name").notNull(),
  ...timestamps(),
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  order: integer("order").notNull(),
  ...timestamps(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  job_id: uuid("job_id")
    .references(() => jobs.id)
    .notNull(),
  description: text("description").notNull(),
  completed: boolean().default(false).notNull(),
  ...timestamps(),
});

export type InsertJob = typeof jobs.$inferInsert;
export type SelectJob = typeof jobs.$inferSelect;

// Zod Validation Schemas
export const jobInsertSchema = createInsertSchema(jobs);
export const jobSelectSchema = createSelectSchema(jobs);
