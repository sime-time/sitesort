import { DrizzleAppSchema } from "@powersync/drizzle-driver";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const jobs = sqliteTable("jobs", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export type InsertJob = typeof jobs.$inferInsert;
export type SelectJob = typeof jobs.$inferSelect;

export const drizzleSchema = { jobs };

// Infer the PowerSync schema from your Drizzle schema
export const AppSchema = new DrizzleAppSchema(drizzleSchema);
