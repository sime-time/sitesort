import { eq } from "drizzle-orm";
import { db } from "$lib/sql/client/db";
import { tasks } from "$lib/sql/client/schema";

export async function toggleTask(id: string, completed: boolean) {
  const update = await db
    .update(tasks)
    .set({ completed: completed })
    .where(eq(tasks.id, id));

  return update;
}
