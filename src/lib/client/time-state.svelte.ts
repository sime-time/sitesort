// src/lib/client/time-state.svelte.ts
export type TimeEntry = {
  id: string;
  clockInAt: string;
  clockOutAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "sitesort.timeEntries.v1";

export const timeState = $state({
  entries: [] as TimeEntry[],
  nowMs: Date.now(),
  hydrated: false,
});

let timer: number | null = null;
let initialized = false;

export function initTimeState() {
  if (initialized) return;
  initialized = true;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) timeState.entries = parsed;
    } catch {}
  }
  timeState.hydrated = true;
}

export function startClock() {
  if (timer !== null) return;
  timer = window.setInterval(() => (timeState.nowMs = Date.now()), 1000);
}

export function stopClock() {
  if (timer === null) return;
  window.clearInterval(timer);
  timer = null;
}

export function parseLocalDatetime(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function toDatetimeLocalValue(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function getLocalDayKey(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDayHeading(dayKey: string): string {
  const [year, month, day] = dayKey.split("-").map(Number);
  const date = new Date(year, (month || 1) - 1, day || 1);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatTimeLabel(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "--";

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatDuration(milliseconds: number): string {
  const safeMs = Math.max(0, milliseconds);
  const totalSeconds = Math.floor(safeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function getEntryDuration(entry: TimeEntry): string {
  const clockInMs = new Date(entry.clockInAt).getTime();
  const clockOutMs = entry.clockOutAt
    ? new Date(entry.clockOutAt).getTime()
    : timeState.nowMs;

  return formatDuration(clockOutMs - clockInMs);
}
