import { and, eq } from "drizzle-orm";
import { db, powerSyncDb } from "$lib/client/db";
import { jobs, type SelectJob } from "$lib/client/schema";

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

export async function getUserJob(userId: string, jobId: string) {
  const job: SelectJob[] = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.user_id, userId), eq(jobs.id, jobId)))
    .limit(1);

  return job[0];
}
