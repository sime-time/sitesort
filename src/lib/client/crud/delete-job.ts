import { eq } from "drizzle-orm";
import { db } from "$lib/client/db";
import { job_materials, jobs, tasks } from "$lib/client/schema";

export async function deleteJob(id: string) {
  // delete related job_materials
  await db.delete(job_materials).where(eq(job_materials.job_id, id));

  // delete related tasks
  await db.delete(tasks).where(eq(tasks.job_id, id));

  // delete job
  const deleted = await db.delete(jobs).where(eq(jobs.id, id));
  return deleted;
}
