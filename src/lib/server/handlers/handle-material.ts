import { eq } from "drizzle-orm";
import {
  type InsertMaterial,
  materialInsertSchema,
  materials,
} from "$lib/server/schema";
import { UnauthorizedUploadError } from "$lib/utils/error-handling";
import { normalizeBool } from "$lib/utils/normalize-bool";
import type { CrudEntryType, DbTransaction } from "./upload-schema";

export async function handleMaterialEntry(
  tx: DbTransaction,
  entry: CrudEntryType,
) {
  switch (entry.op) {
    case "PUT": {
      const raw = entry.data ?? {};
      const normalized = {
        ...raw,
        completed: normalizeBool(raw.completed),
      };

      const parsed = materialInsertSchema.parse(normalized);

      const row: InsertMaterial = {
        id: entry.id,
        name: parsed.name,
        category_id: parsed.category_id,
        created_at: parsed.created_at,
        updated_at: parsed.updated_at,
      };

      await tx
        .insert(materials)
        .values(row)
        .onConflictDoUpdate({
          target: materials.id,
          set: {
            name: row.name,
            category_id: row.category_id,
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

      const parsed = materialInsertSchema.partial().parse(normalized);
      const patch: Partial<InsertMaterial> = {
        ...parsed,
        updated_at: parsed.updated_at ?? new Date().toISOString(),
      };

      const updated = await tx
        .update(materials)
        .set(patch)
        .where(eq(materials.id, entry.id))
        .returning({ id: materials.id });

      if (updated.length === 0) {
        throw new UnauthorizedUploadError();
      }
      break;
    }
    case "DELETE": {
      const deleted = await tx
        .delete(materials)
        .where(eq(materials.id, entry.id))
        .returning({ id: materials.id });

      if (deleted.length === 0) {
        throw new UnauthorizedUploadError();
      }
      break;
    }

    default:
      break;
  }
}
