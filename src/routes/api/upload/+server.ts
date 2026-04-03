import { json, type RequestHandler } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { uploadBodySchema } from "$lib/schemas/valid-job";
import { db } from "$lib/sql/server/db";
import { type InsertJob, jobInsertSchema, jobs } from "$lib/sql/server/schema";
import { getErrorCode } from "$lib/utils/error-handling";

export const POST: RequestHandler = async ({ request }) => {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer")) {
    return json(
      { ok: false, message: "Invalid authorization header" },
      { status: 401 },
    );
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    return json(
      { ok: false, message: "Missing bearer token" },
      { status: 401 },
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return json({
      ok: false,
      message: "Invalid JSON body",
      errorCode: "22023",
    });
  }

  const bodyParsed = uploadBodySchema.safeParse(rawBody);
  if (!bodyParsed.success) {
    return json({
      ok: false,
      message: "Invalid upload data",
      errorCode: "22023",
    });
  }

  const { crud } = bodyParsed.data;
  if (crud.length === 0) {
    return json({ ok: true });
  }

  // Drizzle upload transaction
  try {
    await db.transaction(async (tx) => {
      for (const entry of crud) {
        switch (entry.op) {
          case "PUT": {
            const parsed = jobInsertSchema.parse(entry.opData);
            const row: InsertJob = {
              id: entry.id,
              user_id: parsed.user_id,
              name: parsed.name,
              address: parsed.address,
              start_date: parsed.start_date,
              end_date: parsed.end_date ?? null,
              created_at: parsed.created_at,
              updated_at: parsed.updated_at,
            };

            await tx
              .insert(jobs)
              .values(row)
              .onConflictDoUpdate({
                target: jobs.id,
                set: {
                  user_id: row.user_id,
                  name: row.name,
                  address: row.address,
                  start_date: row.start_date,
                  end_date: row.end_date,
                  created_at: row.created_at,
                  updated_at: row.updated_at,
                },
              });

            break;
          }
          case "PATCH": {
            const parsed = jobInsertSchema.parse(entry.opData);
            const patch: Partial<InsertJob> = {
              ...parsed,
              updated_at: parsed.updated_at ?? new Date().toISOString(),
            };
            await tx.update(jobs).set(patch).where(eq(jobs.id, entry.id));
            break;
          }
          case "DELETE":
            await tx.delete(jobs).where(eq(jobs.id, entry.id));
            break;

          default:
            break;
        }
      } // end loop
    }); // end transaction

    return json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return json({
        ok: false,
        message: "Invalid operation payload",
        errorCode: "22023",
      });
    }

    const errorCode = getErrorCode(err);
    const message = err instanceof Error ? err.message : "Upload failed";

    if (errorCode) {
      return json({ ok: false, message, errorCode });
    }

    return json(
      {
        ok: false,
        message: "Transient upload failure",
      },
      { status: 500 },
    );
  }
};
