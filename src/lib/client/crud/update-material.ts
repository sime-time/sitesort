import { eq } from "drizzle-orm";
import { db } from "$lib/client/db";
import { job_materials } from "$lib/client/schema";

export async function updateJobMaterialQuantity(id: string, quantity: number) {
  const now = new Date().toISOString();
  const safeQuantity = Math.max(0, Math.trunc(quantity));

  const update = await db
    .update(job_materials)
    .set({ quantity: safeQuantity, updated_at: now })
    .where(eq(job_materials.id, id));

  return update;
}
