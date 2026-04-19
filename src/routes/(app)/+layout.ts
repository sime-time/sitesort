import { redirect } from "@sveltejs/kit";
import { authClient } from "$lib/client/auth";
import { LAST_KNOWN_USER_ID_KEY } from "$lib/utils/last-known-user";
import type { LayoutLoad } from "./$types";

export const ssr = false;

export const load: LayoutLoad = async () => {
  const cachedUserId = localStorage.getItem(LAST_KNOWN_USER_ID_KEY);

  // Local-first: do not block returning users on network/auth
  if (cachedUserId) {
    return {
      user_id: cachedUserId,
      authState: "offline_grace" as const,
    };
  }

  // First-login / no cache path
  try {
    const { data } = await authClient.getSession();
    if (data?.session?.token && data.user?.id) {
      localStorage.setItem(LAST_KNOWN_USER_ID_KEY, data.user.id);
      return {
        user_id: data.user.id,
        authState: "online" as const,
      };
    }
  } catch {
    // ignore; fall through to auth redirect
  }

  throw redirect(302, "/auth");
};
