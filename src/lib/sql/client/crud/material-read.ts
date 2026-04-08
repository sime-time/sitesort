import { eq } from "drizzle-orm";
import { db } from "$lib/sql/client/db";
import { job_materials, type SelectJobMaterial } from "$lib/sql/client/schema";

export async function listJobMaterials(jobId: string) {
  const jobMaterials: SelectJobMaterial[] = await db
    .select()
    .from(job_materials)
    .where(eq(job_materials.job_id, jobId))
    .orderBy(job_materials.created_at);

  return jobMaterials || [];
}
