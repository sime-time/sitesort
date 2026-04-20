import { eq } from "drizzle-orm";
import { db, powerSyncDb } from "$lib/client/db";
import { type SelectTask, tasks } from "$lib/client/schema";

export async function listJobTasks(jobId: string) {
  const taskList: SelectTask[] = await db
    .select()
    .from(tasks)
    .where(eq(tasks.job_id, jobId))
    .orderBy(tasks.order);

  return taskList || [];
}

export function watchJobTasks(
  jobId: string,
  onTasks: (tasks: SelectTask[]) => void,
  onError?: (error: unknown) => void,
) {
  const watched = powerSyncDb
    .query({
      sql: "select * from tasks where job_id = ? order by 'order'",
      parameters: [jobId],
    })
    .watch();

  const dispose = watched.registerListener({
    onData: (data) => onTasks(data as SelectTask[]),
    onError: (error) => onError?.(error),
  });

  return dispose;
}
