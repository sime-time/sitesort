import { eq } from "drizzle-orm";
import {
  type InsertJobMaterial,
  job_materials,
  jobMaterialInsertSchema,
} from "$lib/server/schema";
import { UnauthorizedUploadError } from "$lib/utils/error-handling";
import { normalizeBool } from "$lib/utils/normalize-bool";
import type { CrudEntryType, DbTransaction } from "./upload-schema";

export async function handleJobMaterialEntry(
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

      const parsed = jobMaterialInsertSchema.parse(normalized);

      const row: InsertJobMaterial = {
        id: entry.id,
        job_id: parsed.job_id,
        material_id: parsed.material_id,
        quantity: parsed.quantity,
        created_at: parsed.created_at,
        updated_at: parsed.updated_at,
      };

      await tx
        .insert(job_materials)
        .values(row)
        .onConflictDoUpdate({
          target: job_materials.id,
          set: {
            job_id: row.job_id,
            material_id: row.material_id,
            quantity: row.quantity,
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

      const parsed = jobMaterialInsertSchema.partial().parse(normalized);
      const patch: Partial<InsertJobMaterial> = {
        ...parsed,
        updated_at: parsed.updated_at ?? new Date().toISOString(),
      };

      const updated = await tx
        .update(job_materials)
        .set(patch)
        .where(eq(job_materials.id, entry.id))
        .returning({ id: job_materials.id });

      if (updated.length === 0) {
        throw new UnauthorizedUploadError();
      }
      break;
    }
    case "DELETE": {
      const deleted = await tx
        .delete(job_materials)
        .where(eq(job_materials.id, entry.id))
        .returning({ id: job_materials.id });

      if (deleted.length === 0) {
        throw new UnauthorizedUploadError();
      }
      break;
    }

    default:
      break;
  }
}
