import { type ZodError, z } from "zod";
import { db } from "$lib/sql/client/db";
import { type InsertJob, jobs } from "$lib/sql/client/schema";

export const createJobSchema = z.object({
  user_id: z.string(),
  name: z
    .string()
    .min(1, "Must include a job name")
    .max(50, "Name must be less than 50 characters"),
  start_date: z.coerce.date(),
  address: z
    .string()
    .min(1, "Must include a valid address")
    .max(100, "Address must be less than 100 characters"),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;

export async function createJob(input: CreateJobInput) {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  console.log("Inserting job...");
  const result = await db.insert(jobs).values({
    id: id,
    user_id: input.user_id,
    name: input.name,
    address: input.address,
    start_date: input.start_date.toISOString(),
    end_date: null,
    created_at: now,
    updated_at: now,
  } satisfies InsertJob);

  console.log("Job inserted:", result);
  return { id };
}

export function mapCreateJobErrors(error: ZodError<CreateJobInput>) {
  const flat = z.flattenError(error);
  return {
    name: flat.fieldErrors.name?.[0],
    start_date: flat.fieldErrors.start_date?.[0],
    address: flat.fieldErrors.address?.[0],
  };
}
