import { eq } from "drizzle-orm";
import { db } from "$lib/sql/client/db";
import { type SelectTask, tasks } from "$lib/sql/client/schema";

export async function listJobTasks(jobId: string) {
  const taskList: SelectTask[] = await db
    .select()
    .from(tasks)
    .where(eq(tasks.job_id, jobId))
    .orderBy(tasks.order);

  return taskList || [];
}
