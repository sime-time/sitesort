import { and, eq } from "drizzle-orm";
import {
  type InsertJob,
  jobInsertSchema,
  jobs,
  jobUpdateSchema,
} from "$lib/server/schema";
import { UnauthorizedUploadError } from "$lib/utils/error-handling";
import { normalizeBool } from "$lib/utils/normalize-bool";
import type { CrudEntryType, DbTransaction } from "./upload-schema";

export async function handleJobEntry(
  tx: DbTransaction,
  entry: CrudEntryType,
  user_id: string,
) {
  switch (entry.op) {
    case "PUT": {
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
      const raw = entry.data ?? {};
      const normalized = {
        ...raw,
        completed: normalizeBool(raw.completed),
      };

      const parsed = jobUpdateSchema.parse(normalized);
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
