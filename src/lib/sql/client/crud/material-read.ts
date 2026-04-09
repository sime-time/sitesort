import { eq } from "drizzle-orm";
import { db } from "$lib/sql/client/db";
import { categories, job_materials, materials } from "$lib/sql/client/schema";

export type JobMaterial = {
  id: string;
  name: string;
  category: string;
  quantity: number;
};

export async function listJobMaterials(jobId: string) {
  const jobMaterials: JobMaterial[] = await db
    .select({
      id: job_materials.id,
      name: materials.name,
      category: categories.name,
      quantity: job_materials.quantity,
    })
    .from(job_materials)
    .innerJoin(materials, eq(job_materials.material_id, materials.id))
    .innerJoin(categories, eq(materials.category_id, categories.id))
    .where(eq(job_materials.job_id, jobId))
    .orderBy(categories.order, materials.name);

  return jobMaterials || [];
}
