import { json, type RequestHandler } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { z } from "zod";
import { dev } from "$app/environment";
import {
  NEON_AUTH_AUDIENCE,
  NEON_AUTH_ISSUER,
  NEON_AUTH_JWKS_URL,
} from "$env/static/private";
import { uploadBodySchema } from "$lib/schemas/valid-job";
import { db } from "$lib/sql/server/db";
import { type InsertJob, jobInsertSchema, jobs } from "$lib/sql/server/schema";
import {
  getErrorCode,
  UnauthorizedUploadError,
} from "$lib/utils/error-handling";

const JWKS = createRemoteJWKSet(new URL(NEON_AUTH_JWKS_URL));

async function verifyBearerToken(token: string): Promise<{ user_id: string }> {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: NEON_AUTH_ISSUER,
    audience: NEON_AUTH_AUDIENCE,
  });

  if (typeof payload.sub !== "string" || payload.sub.length === 0) {
    throw new Error("Token missing subject");
  }

  return { user_id: payload.sub };
}

export const POST: RequestHandler = async ({ request }) => {
  const authHeader = request.headers.get("authorization");
  const bearerLabel = "Bearer ";

  if (!authHeader?.startsWith(bearerLabel)) {
    return json({ ok: false, message: "Invalid auth header" }, { status: 401 });
  }

  const token = authHeader?.slice(bearerLabel.length).trim();
  if (!token) {
    return json(
      { ok: false, message: "Missing bearer token" },
      { status: 401 },
    );
  }

  let auth: { user_id: string };

  try {
    auth = await verifyBearerToken(token);
  } catch {
    return json(
      { ok: false, message: "Invalid or expired token" },
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
            const parsed = jobInsertSchema.parse(entry.data);

            if (parsed.user_id !== auth.user_id) {
              throw new UnauthorizedUploadError();
            }

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
            const parsed = jobInsertSchema.parse(entry.data);
            const patch: Partial<InsertJob> = {
              ...parsed,
              updated_at: parsed.updated_at ?? new Date().toISOString(),
            };
            const updated = await tx
              .update(jobs)
              .set(patch)
              .where(and(eq(jobs.id, entry.id), eq(jobs.user_id, auth.user_id)))
              .returning({ id: jobs.id });

            if (updated.length === 0) {
              throw new UnauthorizedUploadError();
            }
            break;
          }
          case "DELETE": {
            const deleted = await tx
              .delete(jobs)
              .where(and(eq(jobs.id, entry.id), eq(jobs.user_id, auth.user_id)))
              .returning({ id: jobs.id });

            if (deleted.length === 0) {
              throw new UnauthorizedUploadError();
            }
            break;
          }

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

    if (err instanceof UnauthorizedUploadError) {
      return json(
        { ok: false, message: err.message, errorCode: "42501" },
        { status: 200 },
      );
    }

    const errorCode = getErrorCode(err);
    const message = err instanceof Error ? err.message : "Upload failed";

    if (dev) {
      console.error("[upload] transaction failed", {
        crudCount: crud.length,
        errorCode,
        message,
        errName: err instanceof Error ? err.name : null,
      });
    }

    if (errorCode) {
      return json({ ok: false, message, errorCode });
    }

    return json(
      {
        ok: false,
        message: dev ? message : "Transient upload failure",
        errorCode: errorCode ?? undefined,
      },
      { status: 500 },
    );
  }
};
