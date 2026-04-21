import { eq } from "drizzle-orm";
import { type ZodError, z } from "zod";
import { db } from "$lib/client/db";
import { jobs } from "$lib/client/schema";

export const updateJobSchema = z
  .object({
    id: z.uuid(),
    name: z
      .string()
      .min(1, "Must include a job name")
      .max(50, "Name must be less than 50 characters")
      .optional(),
    address: z
      .string()
      .min(1, "Must include a valid address")
      .max(100, "Address must be less than 100 characters")
      .optional(),
    completed: z.boolean().optional(),
    start_date: z.coerce.date().optional(),
    end_date: z.coerce.date().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.start_date && data.end_date && data.start_date > data.end_date) {
      ctx.addIssue({
        code: "custom",
        path: ["end_date"],
        message: "End date must be on or after start date",
      });
    }
  });

export type UpdateJob = z.infer<typeof updateJobSchema>;

export async function updateJob(input: UpdateJob) {
  const now = new Date().toISOString();

  let startDate: string | undefined;
  if (input.start_date) {
    startDate = new Date(input.start_date).toISOString();
  }
  let endDate: string | undefined;
  if (input.end_date) {
    endDate = new Date(input.end_date).toISOString();
  }

  const update = await db
    .update(jobs)
    .set({
      name: input.name,
      address: input.address,
      completed: input.completed,
      start_date: startDate,
      end_date: endDate,
      updated_at: now,
    })
    .where(eq(jobs.id, input.id));

  return update;
}

export function mapUpdateJobErrors(error: ZodError<UpdateJob>) {
  const flat = z.flattenError(error);
  return {
    name: flat.fieldErrors.name?.[0],
    start_date: flat.fieldErrors.start_date?.[0],
    end_date: flat.fieldErrors.end_date?.[0],
    address: flat.fieldErrors.address?.[0],
    completed: flat.fieldErrors.completed?.[0],
  };
}
