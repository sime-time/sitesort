import { and, eq } from "drizzle-orm";
import {
  type InsertTimeEntry,
  time_entries,
  timeEntryInsertSchema,
  timeEntryUpdateSchema,
} from "$lib/server/schema";
import { UnauthorizedUploadError } from "$lib/utils/error-handling";
import type { CrudEntryType, DbTransaction } from "./upload-schema";

export async function handleTimeEntry(
  tx: DbTransaction,
  entry: CrudEntryType,
  user_id: string,
) {
  switch (entry.op) {
    case "PUT": {
      const raw = entry.data ?? {};

      const parsed = timeEntryInsertSchema.parse(raw);

      if (parsed.user_id !== user_id) {
        throw new UnauthorizedUploadError();
      }

      const row: InsertTimeEntry = {
        id: entry.id,
        user_id: parsed.user_id,
        clock_in: parsed.clock_in,
        clock_out: parsed.clock_out,
        created_at: parsed.created_at,
        updated_at: parsed.updated_at,
      };

      await tx
        .insert(time_entries)
        .values(row)
        .onConflictDoUpdate({
          target: time_entries.id,
          set: {
            user_id: row.user_id,
            clock_in: row.clock_in,
            clock_out: row.clock_out,
            created_at: row.created_at,
            updated_at: row.updated_at,
          },
        });

      break;
    }
    case "PATCH": {
      const raw = entry.data ?? {};

      const parsed = timeEntryUpdateSchema.parse(raw);

      if (parsed.user_id !== undefined) {
        throw new UnauthorizedUploadError();
      }

      const patch: Partial<InsertTimeEntry> = {
        clock_in: parsed.clock_in,
        clock_out: parsed.clock_out,
        created_at: parsed.created_at,
        updated_at: parsed.updated_at ?? new Date().toISOString(),
      };

      const updated = await tx
        .update(time_entries)
        .set(patch)
        .where(
          and(eq(time_entries.id, entry.id), eq(time_entries.user_id, user_id)),
        )
        .returning({ id: time_entries.id });

      if (updated.length === 0) {
        throw new UnauthorizedUploadError();
      }
      break;
    }
    case "DELETE": {
      const deleted = await tx
        .delete(time_entries)
        .where(
          and(eq(time_entries.id, entry.id), eq(time_entries.user_id, user_id)),
        )
        .returning({ id: time_entries.id });

      if (deleted.length === 0) {
        throw new UnauthorizedUploadError();
      }
      break;
    }

    default:
      break;
  }
}
