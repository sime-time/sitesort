import { desc, eq } from "drizzle-orm";
import { type ZodError, z } from "zod";
import { db } from "$lib/client/db";
import { type InsertTask, tasks } from "$lib/client/schema";

export const createTaskSchema = z.object({
  job_id: z.string().nonoptional(),
  description: z.string().min(1, "Must describe task"),
  completed: z.boolean(),
});

export type CreateTask = z.infer<typeof createTaskSchema>;

export async function createTask(input: CreateTask) {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  // get the highest order value task from this job
  const jobOrder = await db
    .select({ order: tasks.order })
    .from(tasks)
    .where(eq(tasks.job_id, input.job_id))
    .orderBy(desc(tasks.order));

  const highestOrder = jobOrder[0].order || 0;

  await db.insert(tasks).values({
    id: id,
    job_id: input.job_id,
    description: input.description,
    completed: input.completed,
    order: highestOrder + 1,
    created_at: now,
    updated_at: now,
  } satisfies InsertTask);

  return { id };
}

export function mapCreateTaskErrors(error: ZodError<CreateTask>) {
  const flat = z.flattenError(error);
  return {
    description: flat.fieldErrors.description?.[0],
    completed: flat.fieldErrors.completed?.[0],
  };
}
