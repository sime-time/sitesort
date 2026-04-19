import { redirect } from "@sveltejs/kit";
import { authClient } from "$lib/client/auth";
import type { LayoutLoad } from "./$types";

export const ssr = false;

const LAST_USER_ID_KEY = "sitesort.last_user_id";

function readLastKnownUserId(): string | undefined {
  if (typeof localStorage === "undefined") return undefined;
  const value = localStorage.getItem(LAST_USER_ID_KEY);
  return value && value.length > 0 ? value : undefined;
}

function writeLastKnownUserId(userId: string): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(LAST_USER_ID_KEY, userId);
}

export const load: LayoutLoad = async () => {
  const offline =
    typeof navigator !== "undefined" && navigator.onLine === false;
  const lastKnownUserId = readLastKnownUserId();

  let sessionResult: Awaited<ReturnType<typeof authClient.getSession>>;

  try {
    sessionResult = await authClient.getSession();
  } catch {
    if (offline) {
      return {
        authState: "unknown_offline" as const,
        user_id: lastKnownUserId,
      };
    }

    throw redirect(302, "/auth");
  }

  const { data, error } = sessionResult;

  // Authenticated: trust session, persist user id for offline grace
  if (data?.session && !error) {
    writeLastKnownUserId(data.user.id);
    return {
      authState: "authenticated" as const,
      user_id: data.user.id,
    };
  }

  // Session missing but offline: allow local-only mode
  if (!data?.session && !error && offline) {
    return {
      authState: "unknown_offline" as const,
      user_id: lastKnownUserId,
    };
  }

  // Explicit error while offline: allow local-only mode
  if (error && offline) {
    return {
      authState: "unknown_offline" as const,
      user_id: lastKnownUserId,
    };
  }

  // Online unauthenticated/error -> real auth flow
  throw redirect(302, "/auth");
};
