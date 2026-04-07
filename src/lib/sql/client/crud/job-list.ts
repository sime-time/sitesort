import { eq } from "drizzle-orm";
import { db, powerSyncDb } from "$lib/sql/client/db";
import { jobs, type SelectJob } from "$lib/sql/client/schema";

export function watchUserJobs(
  userId: string,
  onJobs: (jobs: SelectJob[]) => void,
  onError?: (error: unknown) => void,
) {
  const watched = powerSyncDb
    .query({
      sql: "select * from jobs where user_id = ? order by created_at, id",
      parameters: [userId],
    })
    .watch();

  const dispose = watched.registerListener({
    onData: (data) => onJobs(data as SelectJob[]),
    onError: (error) => onError?.(error),
  });

  return dispose;
}

export async function listUserJobs(userId: string) {
  const jobList: SelectJob[] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.user_id, userId))
    .orderBy(jobs.created_at);

  return jobList || [];
}
