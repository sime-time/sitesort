import { redirect } from "@sveltejs/kit";
import { authClient } from "$lib/sql/client/auth";
import type { LayoutLoad } from "./$types";

export const ssr = false;

export const load: LayoutLoad = async () => {
  const { data } = await authClient.getSession();
  if (!data?.session) {
    throw redirect(302, `/auth`);
  }
  return {};
};
