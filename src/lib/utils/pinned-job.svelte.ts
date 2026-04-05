// Write pinned job id to local storage
export function writePinnedJobId(user_id: string, id: string | null) {
  const pinnedStorageKey = `sitesort:pinned-job:${user_id}`;

  if (id) {
    localStorage.setItem(pinnedStorageKey, id);
  } else {
    localStorage.removeItem(pinnedStorageKey);
  }
}

// Read pinned job from local storage
export function readPinnedJobId(user_id: string): string | null {
  const pinnedStorageKey = `sitesort:pinned-job:${user_id}`;

  const id = localStorage.getItem(pinnedStorageKey);
  return id ?? null;
}
