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
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date().toISOString()),
  },
  (table) => [index("user_idx").on(table.user_id)],
);

export const materials = pgTable("materials", {
  id: uuid("id").defaultRandom().primaryKey(),
  job_id: text("job_id")
    .references(() => jobs.id)
    .notNull(),
  name: text("name").notNull(),
  quantity: integer("quantity").default(0).notNull(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  job_id: text("job_id")
    .references(() => jobs.id)
    .notNull(),
  description: text("description").notNull(),
  is_completed: boolean().default(false).notNull(),
});

export type InsertJob = typeof jobs.$inferInsert;
export type SelectJob = typeof jobs.$inferSelect;

// Zod Validation Schemas
export const jobInsertSchema = createInsertSchema(jobs);
export const jobSelectSchema = createSelectSchema(jobs);
