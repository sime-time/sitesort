import { db } from "$lib/sql/client/db";
import { type InsertJob, jobs } from "$lib/sql/client/schema";

interface CreateJobInput {
  user_id: string;
  name: string;
  address: string;
  start_date: Date;
}

export async function createJob(input: CreateJobInput) {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  console.log("Inserting job...");
  await db.insert(jobs).values({
    id: id,
    user_id: input.user_id,
    name: input.name,
    address: input.address,
    start_date: input.start_date.toISOString(),
    end_date: null,
    created_at: now,
    updated_at: now,
  } satisfies InsertJob);

  console.log("Job inserted:", id);
  return { id };
}
