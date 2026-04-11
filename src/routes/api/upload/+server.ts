import { json, type RequestHandler } from "@sveltejs/kit";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { z } from "zod";
import { dev } from "$app/environment";
import {
  NEON_AUTH_AUDIENCE,
  NEON_AUTH_ISSUER,
  NEON_AUTH_JWKS_URL,
} from "$env/static/private";
import {
  type CrudEntryType,
  type DbTransaction,
  uploadBodySchema,
} from "$lib/handlers/entry-schema";
import { handleJobEntry } from "$lib/handlers/handle-job";
import { handleTaskEntry } from "$lib/handlers/handle-task";
import { db } from "$lib/sql/server/db";
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

  const { crud }: { crud: CrudEntryType[] } = bodyParsed.data;
  if (crud.length === 0) {
    return json({ ok: true });
  }

  // Drizzle upload transaction
  try {
    await db.transaction(async (tx: DbTransaction) => {
      for (const entry of crud) {
        switch (entry.type) {
          case "jobs":
            return handleJobEntry(tx, entry, auth.user_id);
          case "tasks":
            return handleTaskEntry(tx, entry, auth.user_id);
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
