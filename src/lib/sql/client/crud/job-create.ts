import { db } from "$lib/sql/client/db";
import { type InsertJob, jobs } from "$lib/sql/client/schema";

interface CreateJobInput {
  userId: string;
  name: string;
  address: string;
  date: Date;
}

export async function createJob(input: CreateJobInput) {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  console.log("Inserting job...");
  await db.insert(jobs).values({
    id: id,
    userId: input.userId,
    name: input.name,
    address: input.address,
    startDate: input.date.toISOString(),
    endDate: null,
    createdAt: now,
    updatedAt: now,
  } satisfies InsertJob);

  console.log("Job inserted:", id);
  return { id };
}
