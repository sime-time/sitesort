import { type ZodError, z } from "zod";

export const newJobSchema = z.object({
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

export type NewJobInput = z.infer<typeof newJobSchema>;

export function mapNewJobErrors(error: ZodError<NewJobInput>) {
  const flat = z.flattenError(error);
  return {
    name: flat.fieldErrors.name?.[0],
    start_date: flat.fieldErrors.start_date?.[0],
    address: flat.fieldErrors.address?.[0],
  };
}

// CRUD upload validation
export const insertJobSchema = createInsertSchema(jobs);
export const putJobDataSchema = insertJobSchema.omit({ id: true });
export const crudEntrySchema = z.object({
  id: z.uuid(),
  op: z.enum(["PUT", "PATCH", "DELETE"]),
  table: z.literal("jobs"),
  opData: z.record(z.string(), z.unknown()).optional(),
});

export const uploadBodySchema = z.object({
  crud: z.array(crudEntrySchema),
});
