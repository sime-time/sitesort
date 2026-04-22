import { and, desc, eq, isNull } from "drizzle-orm";
import { authClient } from "$lib/client/auth";
import { db } from "$lib/client/db";
import {
  type InsertTimeEntry,
  type SelectTimeEntry,
  time_entries,
} from "$lib/client/schema";
import { LAST_KNOWN_USER_ID_KEY } from "$lib/utils/last-known-user";

async function getUserId(): Promise<string> {
  const { data, error } = await authClient.getSession();
  if (!error && data?.user?.id) return data.user.id;

  const cachedUserId = localStorage.getItem(LAST_KNOWN_USER_ID_KEY);
  if (cachedUserId) return cachedUserId;

  throw new Error("Missing authenticated user");
}

export async function listTimeEntries(): Promise<SelectTimeEntry[]> {
  const userId = await getUserId();
  return db
    .select()
    .from(time_entries)
    .where(eq(time_entries.user_id, userId))
    .orderBy(desc(time_entries.clock_in));
}

export async function createClockIn(nowIso: string): Promise<{ id: string }> {
  const userId = await getUserId();
  const id = crypto.randomUUID();
  await db.insert(time_entries).values({
    id,
    user_id: userId,
    clock_in: nowIso,
    clock_out: null,
    created_at: nowIso,
    updated_at: nowIso,
  } satisfies InsertTimeEntry);
  return { id };
}

export async function closeOpenEntry(
  entryId: string,
  nowIso: string,
): Promise<void> {
  const userId = await getUserId();
  await db
    .update(time_entries)
    .set({ clock_out: nowIso, updated_at: nowIso })
    .where(and(eq(time_entries.id, entryId), eq(time_entries.user_id, userId)));
}

export async function updateTimeEntry(
  entryId: string,
  clockInIso: string,
  clockOutIso: string | null,
): Promise<void> {
  const userId = await getUserId();
  const nowIso = new Date().toISOString();
  await db
    .update(time_entries)
    .set({ clock_in: clockInIso, clock_out: clockOutIso, updated_at: nowIso })
    .where(and(eq(time_entries.id, entryId), eq(time_entries.user_id, userId)));
}

export async function deleteTimeEntry(entryId: string): Promise<void> {
  const userId = await getUserId();
  await db
    .delete(time_entries)
    .where(and(eq(time_entries.id, entryId), eq(time_entries.user_id, userId)));
}

export async function findOpenEntry(): Promise<SelectTimeEntry | null> {
  const userId = await getUserId();
  const rows = await db
    .select()
    .from(time_entries)
    .where(
      and(eq(time_entries.user_id, userId), isNull(time_entries.clock_out)),
    );
  return rows[0] ?? null;
}
