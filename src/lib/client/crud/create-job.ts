import { eq } from "drizzle-orm";
import { type ZodError, z } from "zod";
import { db } from "$lib/client/db";
import {
  type InsertJob,
  type InsertJobMaterial,
  type InsertTask,
  job_materials,
  jobs,
  tasks,
  template_materials,
  template_tasks,
} from "$lib/client/schema";

export const createJobSchema = z.object({
  user_id: z.string(),
  template_id: z.string().min(1, "Must select a job template"),
  name: z
    .string()
    .min(1, "Must include a job name")
    .max(50, "Name must be less than 50 characters"),
  address: z
    .string()
    .max(100, "Address must be less than 100 characters")
    .optional(),
  contractor: z
    .string()
    .max(50, "Contractor name must be less than 50 characters")
    .optional(),
  start_date: z.coerce.date(),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;

export async function createJob(input: CreateJobInput) {
  const now = new Date().toISOString();
  const jobId = crypto.randomUUID();
  const templateId = input.template_id;

  await db.transaction(async (tx) => {
    await tx.insert(jobs).values({
      id: jobId,
      template_id: templateId,
      user_id: input.user_id,
      name: input.name,
      address: input.address || null,
      contractor: input.contractor || null,
      start_date: input.start_date.toISOString(),
      end_date: null,
      completed: false,
      created_at: now,
      updated_at: now,
    } satisfies InsertJob);

    // Insert job materials from template
    const materialTemplates = await tx
      .select()
      .from(template_materials)
      .where(eq(template_materials.template_id, templateId));

    if (materialTemplates.length > 0) {
      const rows: InsertJobMaterial[] = materialTemplates.map((mt) => ({
        id: crypto.randomUUID(),
        job_id: jobId,
        material_id: mt.material_id,
        quantity: mt.default_quantity ?? 0,
        note: mt.default_note ?? null,
        created_at: now,
        updated_at: now,
      }));
      await tx.insert(job_materials).values(rows);
    }

    // Insert tasks from template
    const taskTemplates = await tx
      .select()
      .from(template_tasks)
      .where(eq(template_tasks.template_id, templateId));

    if (taskTemplates.length > 0) {
      const rows: InsertTask[] = taskTemplates.map((task) => ({
        id: crypto.randomUUID(),
        job_id: jobId,
        order: task.order,
        description: task.description,
        completed: false,
        created_at: now,
        updated_at: now,
      }));
      await tx.insert(tasks).values(rows);
    }
  });

  return { success: true, id: jobId };
}

export function mapCreateJobErrors(error: ZodError<CreateJobInput>) {
  const flat = z.flattenError(error);
  return {
    name: flat.fieldErrors.name?.[0],
    start_date: flat.fieldErrors.start_date?.[0],
    address: flat.fieldErrors.address?.[0],
    contractor: flat.fieldErrors.contractor?.[0],
    template: flat.fieldErrors.template_id?.[0],
  };
}
