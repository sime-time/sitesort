import { eq } from "drizzle-orm";
import { type InsertTask, taskInsertSchema, tasks } from "$lib/server/schema";
import { UnauthorizedUploadError } from "$lib/utils/error-handling";
import type { CrudEntryType, DbTransaction } from "./upload-schema";

export async function handleTaskEntry(tx: DbTransaction, entry: CrudEntryType) {
  switch (entry.op) {
    case "PUT": {
      const parsed = taskInsertSchema.parse(entry.data);

      const row: InsertTask = {
        id: entry.id,
        job_id: parsed.job_id,
        description: parsed.description,
        order: parsed.order,
        created_at: parsed.created_at,
        updated_at: parsed.updated_at,
      };

      await tx
        .insert(tasks)
        .values(row)
        .onConflictDoUpdate({
          target: tasks.id,
          set: {
            job_id: row.job_id,
            description: row.description,
            order: row.order,
            created_at: row.created_at,
            updated_at: row.updated_at,
          },
        });

      break;
    }
    case "PATCH": {
      const parsed = taskInsertSchema.parse(entry.data);
      const patch: Partial<InsertTask> = {
        ...parsed,
        updated_at: parsed.updated_at ?? new Date().toISOString(),
      };
      const updated = await tx
        .update(tasks)
        .set(patch)
        .where(eq(tasks.id, entry.id))
        .returning({ id: tasks.id });

      if (updated.length === 0) {
        throw new UnauthorizedUploadError();
      }
      break;
    }
    case "DELETE": {
      const deleted = await tx
        .delete(tasks)
        .where(eq(tasks.id, entry.id))
        .returning({ id: tasks.id });

      if (deleted.length === 0) {
        throw new UnauthorizedUploadError();
      }
      break;
    }

    default:
      break;
  }
}
