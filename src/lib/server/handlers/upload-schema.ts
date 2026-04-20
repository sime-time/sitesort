import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import type { PgTransaction } from "drizzle-orm/pg-core";
import { z } from "zod";

// CRUD upload validation
export const crudEntrySchema = z.object({
  id: z.uuid(),
  op: z.enum(["PUT", "PATCH", "DELETE"]),
  type: z.enum(["jobs", "tasks", "materials", "job_materials"]),
  data: z.record(z.string(), z.unknown()).optional(),
});

export const uploadBodySchema = z.object({
  crud: z.array(crudEntrySchema),
});

export type CrudEntryType = z.infer<typeof crudEntrySchema>;

export type DbTransaction = PgTransaction<
  NodePgQueryResultHKT,
  Record<string, never>,
  ExtractTablesWithRelations<Record<string, never>>
>;
