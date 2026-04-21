import { type ZodError, z } from "zod";
import { db } from "$lib/client/db";
import {
  type InsertJob,
  type InsertJobMaterial,
  type InsertTask,
  job_materials,
  jobs,
  materials,
  tasks,
} from "$lib/client/schema";

const DEFAULT_JOB_TASKS = [
  { order: 1, description: "Test all receptacles", completed: false },
  {
    order: 2,
    description: "Test all GFCI's and protected receptacles",
    completed: false,
  },
  { order: 3, description: "Test all switches", completed: false },
  { order: 4, description: "Test smoke detectors", completed: false },
  {
    order: 5,
    description: "Verify all circuits are turned on",
    completed: false,
  },
] as const;

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
  const jobId = crypto.randomUUID();

  await db.transaction(async (tx) => {
    await tx.insert(jobs).values({
      id: jobId,
      user_id: input.user_id,
      name: input.name,
      address: input.address,
      start_date: input.start_date.toISOString(),
      end_date: null,
      completed: false,
      created_at: now,
      updated_at: now,
    } satisfies InsertJob);

    const materialIds = await tx.select({ id: materials.id }).from(materials);

    if (materialIds.length > 0) {
      const rows: InsertJobMaterial[] = materialIds.map((m) => ({
        id: crypto.randomUUID(),
        job_id: jobId,
        material_id: m.id,
        quantity: 0,
        created_at: now,
        updated_at: now,
      }));
      await tx.insert(job_materials).values(rows);
    }

    const taskRows: InsertTask[] = DEFAULT_JOB_TASKS.map((task) => ({
      id: crypto.randomUUID(),
      job_id: jobId,
      order: task.order,
      description: task.description,
      completed: task.completed,
      created_at: now,
      updated_at: now,
    }));

    await tx.insert(tasks).values(taskRows);
  });

  return { success: true, id: jobId };
}

export function mapCreateJobErrors(error: ZodError<CreateJobInput>) {
  const flat = z.flattenError(error);
  return {
    name: flat.fieldErrors.name?.[0],
    start_date: flat.fieldErrors.start_date?.[0],
    address: flat.fieldErrors.address?.[0],
  };
}
