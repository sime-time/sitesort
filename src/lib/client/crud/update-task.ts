import { eq } from "drizzle-orm";
import { db } from "$lib/client/db";
import { tasks } from "$lib/client/schema";

export async function toggleTask(id: string, completed: boolean) {
  const now = new Date().toISOString();

  const update = await db
    .update(tasks)
    .set({ completed: completed, updated_at: now })
    .where(eq(tasks.id, id));

  return update;
}
