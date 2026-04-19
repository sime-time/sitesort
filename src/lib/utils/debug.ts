const enabled =
  typeof window !== "undefined" &&
  (localStorage.getItem("DBG") === "1" ||
    new URL(location.href).searchParams.get("dbg") === "1");

export function dbg(scope: string, event: string, data?: unknown) {
  if (!enabled) return;
  const ts = new Date().toISOString();
  const msg = `[${ts}] [${scope}] ${event}`;
  console.log(msg, data ?? "");
  try {
    const key = "__sitesort_dbg";
    const arr = JSON.parse(localStorage.getItem(key) || "[]");
    arr.push({ ts, scope, event, data });
    if (arr.length > 300) arr.splice(0, arr.length - 300);
    localStorage.setItem(key, JSON.stringify(arr));
  } catch {}
}
