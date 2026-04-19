import { redirect } from "@sveltejs/kit";
import { authClient } from "$lib/client/auth";
import type { LayoutLoad } from "./$types";

export const ssr = false;
const LAST_KNOWN_USER_ID_KEY = "sitesort.lastKnownUserId";

export const load: LayoutLoad = async () => {
  const { data } = await authClient.getSession();

  if (data?.session?.token && data.user?.id) {
    localStorage.setItem(LAST_KNOWN_USER_ID_KEY, data.user.id);
    return {
      user_id: data.user.id,
      authState: "online" as const,
    };
  }

  const lastKnownUserId = localStorage.getItem(LAST_KNOWN_USER_ID_KEY) || null;
  const isOffline = typeof navigator !== "undefined" && !navigator.onLine;

  if (isOffline && lastKnownUserId) {
    return {
      user_id: lastKnownUserId,
      authState: "offline_grace" as const,
    };
  }

  throw redirect(302, "/auth");
};
