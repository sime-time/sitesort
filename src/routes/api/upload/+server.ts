import { json, type RequestHandler } from "@sveltejs/kit";
import { db } from "$lib/sql/server/db";

export const POST: RequestHandler = async ({ request }) => {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return json(
      { ok: false, message: "Missing authorization header" },
      { status: 401 },
    );
  }

  if (!authHeader.startsWith("Bearer")) {
    return json(
      { ok: false, message: "Authorization must be Bearer token" },
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

  return json({ ok: true });
};
