import type { Handle } from "@sveltejs/kit";

// Set cache headers only for HTML responses
// This prevents old HTML documents from being reused after deploy
export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("text/html")) {
    response.headers.set(
      "cache-control",
      "no-store, no-cache, must-revalidate",
    );
    response.headers.set("pragma", "no-cache");
    response.headers.set("expires", "0");
  }
  return response;
};
