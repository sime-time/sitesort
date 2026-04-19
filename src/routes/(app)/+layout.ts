import { redirect } from "@sveltejs/kit";
import { authClient } from "$lib/client/auth";
import { dbg } from "$lib/utils/debug";
import type { LayoutLoad } from "./$types";

export const ssr = false;

export const load: LayoutLoad = async () => {
  let sessionResult: Awaited<ReturnType<typeof authClient.getSession>>;
  try {
    sessionResult = await authClient.getSession();
  } catch {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      return { authState: "unknown_offline" as const };
    }
    throw redirect(302, "/auth");
  }
  const { data, error } = sessionResult;
  dbg("auth", "getSession:start");
  dbg("auth", "getSession:ok", {
    hasSession: !!data?.session,
    hasError: !!error,
    onLine: navigator.onLine,
  });
  dbg("auth", "state", {
    authState: "authenticated|unauthenticated|unknown_offline",
  });

  if (data?.session && !error) {
    return {
      user_id: data.user.id,
      authState: "authenticated" as const,
    };
  }
  if (!data?.session && !error) {
    throw redirect(302, `/auth`);
  }
  if (error) {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      return { authState: "unknown_offline" as const };
    }
    throw redirect(302, `/auth`);
  }

  throw redirect(302, `/auth`);
};
