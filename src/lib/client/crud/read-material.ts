import { eq } from "drizzle-orm";
import { db, powerSyncDb } from "$lib/client/db";
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

export function watchJobMaterials(
  jobId: string,
  onMaterials: (materials: JobMaterial[]) => void,
  onError?: (error: unknown) => void,
) {
  const watched = powerSyncDb
    .query({
      sql: `
        select
          jm.id as id,
          m.name as name,
          jm.quantity as quantity,
          c.name as category
        from job_materials jm
        join materials m on jm.material_id = m.id
        join categories c on m.category_id = c.id
        where jm.job_id = ?
        order by c."order", m.name
      `,
      parameters: [jobId],
    })
    .watch();

  const dispose = watched.registerListener({
    onData: (data) => onMaterials(data as JobMaterial[]),
    onError: (error) => onError?.(error),
  });

  return dispose;
}
