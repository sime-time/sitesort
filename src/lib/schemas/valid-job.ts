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
