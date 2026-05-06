import { eq } from "drizzle-orm";
import { db } from "$lib/client/db";
import { job_materials } from "$lib/client/schema";

export type UpdateJobMaterial = {
  id: string;
  name: string;
  note: string | null;
};

export async function updateJobMaterialQuantity(id: string, quantity: number) {
  const now = new Date().toISOString();
  const safeQuantity = Math.max(0, Math.trunc(quantity));

  const update = await db
    .update(job_materials)
    .set({ quantity: safeQuantity, updated_at: now })
    .where(eq(job_materials.id, id));

  return update;
}

export async function updateJobMaterialNote(id: string, note: string) {
  const now = new Date().toISOString();

  const update = await db
    .update(job_materials)
    .set({ note: note, updated_at: now })
    .where(eq(job_materials.id, id));

  return update;
}

export async function updateJobMaterialCrossedOff(
  id: string,
  crossedOff: boolean,
) {
  const now = new Date().toISOString();

  const update = await db
    .update(job_materials)
    .set({ crossed_off: crossedOff, updated_at: now })
    .where(eq(job_materials.id, id));

  return update;
}
