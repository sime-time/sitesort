import { type ZodError, z } from "zod";
import { db } from "$lib/client/db";
import {
  type InsertJobMaterial,
  type InsertMaterial,
  job_materials,
  materials,
} from "$lib/client/schema";

export const createJobMaterialSchema = z.object({
  job_id: z.string().nonoptional(),
  name: z.string().min(1, "Must describe material used"),
  quantity: z.number().min(0, "Must not be a negative quantity"),
  category_id: z
    .uuid("Must select a material category")
    .nonempty()
    .nonoptional(),
});

export type CreateJobMaterial = z.infer<typeof createJobMaterialSchema>;

export async function createJobMaterial(input: CreateJobMaterial) {
  if (!input.category_id) {
    throw new Error("category_id required");
  }

  const materialId = crypto.randomUUID();
  const jobMaterialId = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.transaction(async (tx) => {
    await tx.insert(materials).values({
      id: materialId,
      name: input.name,
      category_id: input.category_id,
      created_at: now,
      updated_at: now,
    } satisfies InsertMaterial);

    await tx.insert(job_materials).values({
      id: jobMaterialId,
      job_id: input.job_id,
      material_id: materialId,
      quantity: input.quantity,
      created_at: now,
      updated_at: now,
    } satisfies InsertJobMaterial);
  });

  return { success: true, materialId, jobMaterialId };
}

export function mapCreateJobMaterialErrors(error: ZodError<CreateJobMaterial>) {
  const flat = z.flattenError(error);
  return {
    name: flat.fieldErrors.name?.[0],
    quantity: flat.fieldErrors.quantity?.[0],
    category: flat.fieldErrors.category_id?.[0],
  };
}
