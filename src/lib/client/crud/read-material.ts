import { eq } from "drizzle-orm";
import { db } from "$lib/client/db";
import { categories, job_materials, materials } from "$lib/client/schema";

export type JobMaterial = {
  id: string;
  name: string;
  quantity: number;
  category: string;
};

export async function listJobMaterials(jobId: string) {
  const jobMaterials: JobMaterial[] = await db
    .select({
      id: job_materials.id,
      name: materials.name,
      quantity: job_materials.quantity,
      category: categories.name,
      category_id: categories.id,
    })
    .from(job_materials)
    .innerJoin(materials, eq(job_materials.material_id, materials.id))
    .innerJoin(categories, eq(materials.category_id, categories.id))
    .where(eq(job_materials.job_id, jobId))
    .orderBy(categories.order, materials.name);

  return jobMaterials || [];
}
