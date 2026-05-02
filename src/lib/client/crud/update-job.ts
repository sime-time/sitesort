import { eq } from "drizzle-orm";
import { type ZodError, z } from "zod";
import { db } from "$lib/client/db";
import { jobs } from "$lib/client/schema";

export const updateJobSchema = z
  .object({
    id: z.uuid(),
    name: z.string().max(50, "Name must be less than 50 characters").optional(),
    address: z
      .string()
      .max(100, "Address must be less than 100 characters")
      .optional(),
    contractor: z
      .string()
      .max(50, "Contractor name must be less than 50 characters")
      .optional(),
    completed: z.boolean().optional(),
    start_date: z.coerce.date("Must use valid date").optional(),
    end_date: z.coerce.date("Must use valid date").optional(),
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

  // Normalize dates to ISO strings
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
      address: input.address ?? null,
      contractor: input.contractor ?? null,
      completed: input.completed,
      start_date: startDate,
      end_date: endDate ?? null,
      updated_at: now,
    })
    .where(eq(jobs.id, input.id));

  return update;
}

export async function setJobCompleted(id: string, completed: boolean) {
  const now = new Date().toISOString();
  const update = await db
    .update(jobs)
    .set({ completed: completed, updated_at: now })
    .where(eq(jobs.id, id));

  return update;
}

export function mapUpdateJobErrors(error: ZodError<UpdateJob>) {
  const flat = z.flattenError(error);
  return {
    name: flat.fieldErrors.name?.[0],
    start_date: flat.fieldErrors.start_date?.[0],
    end_date: flat.fieldErrors.end_date?.[0],
    address: flat.fieldErrors.address?.[0],
    contractor: flat.fieldErrors.contractor?.[0],
    completed: flat.fieldErrors.completed?.[0],
  };
}
