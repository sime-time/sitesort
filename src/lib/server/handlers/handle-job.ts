import { and, eq } from "drizzle-orm";
import { type InsertJob, jobInsertSchema, jobs } from "$lib/server/schema";
import { UnauthorizedUploadError } from "$lib/utils/error-handling";
import type { CrudEntryType, DbTransaction } from "./upload-schema";

// sqlite makes booleans 0 or 1
// so they must be normalized before uploading to postgres
function normalizeBool(value: unknown): boolean | undefined {
  if (value === 0) return false;
  if (value === 1) return true;
  return undefined;
}

export async function handleJobEntry(
  tx: DbTransaction,
  entry: CrudEntryType,
  user_id: string,
) {
  switch (entry.op) {
    case "PUT": {
      console.log("ENTRY DATA", entry.data);

      const raw = entry.data ?? {};
      const normalized = {
        ...raw,
        completed: normalizeBool(raw.completed),
      };

      const parsed = jobInsertSchema.parse(normalized);

      if (parsed.user_id !== user_id) {
        throw new UnauthorizedUploadError();
      }

      const row: InsertJob = {
        id: entry.id,
        user_id: parsed.user_id,
        name: parsed.name,
        address: parsed.address,
        start_date: parsed.start_date,
        end_date: parsed.end_date ?? null,
        completed: parsed.completed,
        created_at: parsed.created_at,
        updated_at: parsed.updated_at,
      };

      await tx
        .insert(jobs)
        .values(row)
        .onConflictDoUpdate({
          target: jobs.id,
          set: {
            user_id: row.user_id,
            name: row.name,
            address: row.address,
            start_date: row.start_date,
            end_date: row.end_date,
            completed: row.completed,
            created_at: row.created_at,
            updated_at: row.updated_at,
          },
        });

      break;
    }
    case "PATCH": {
      const parsed = jobInsertSchema.parse(entry.data);
      const patch: Partial<InsertJob> = {
        ...parsed,
        updated_at: parsed.updated_at ?? new Date().toISOString(),
      };
      const updated = await tx
        .update(jobs)
        .set(patch)
        .where(and(eq(jobs.id, entry.id), eq(jobs.user_id, user_id)))
        .returning({ id: jobs.id });

      if (updated.length === 0) {
        throw new UnauthorizedUploadError();
      }
      break;
    }
    case "DELETE": {
      const deleted = await tx
        .delete(jobs)
        .where(and(eq(jobs.id, entry.id), eq(jobs.user_id, user_id)))
        .returning({ id: jobs.id });

      if (deleted.length === 0) {
        throw new UnauthorizedUploadError();
      }
      break;
    }

    default:
      break;
  }
}
