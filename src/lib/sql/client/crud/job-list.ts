import { eq } from "drizzle-orm";
import { db } from "$lib/sql/client/db";
import { jobs, type SelectJob } from "$lib/sql/client/schema";

export async function listJobsByUser(userId: string) {
  const jobList: SelectJob[] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.userId, userId))
    .orderBy(jobs.createdAt);

  return jobList || [];
}
