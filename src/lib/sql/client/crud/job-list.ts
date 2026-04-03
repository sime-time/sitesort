import { eq } from "drizzle-orm";
import { db } from "$lib/sql/client/db";
import { jobs, type SelectJob } from "$lib/sql/client/schema";

export async function listJobsByUser(userId: string) {
  const jobList: SelectJob[] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.user_id, userId))
    .orderBy(jobs.created_at);

  return jobList || [];
}
