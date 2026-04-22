import { listTimeEntries } from "$lib/client/crud/time-entries";
import type { SelectTimeEntry } from "$lib/client/schema";

export type TimeEntry = {
  id: string;
  clockInAt: string;
  clockOutAt: string | null;
  createdAt: string;
  updatedAt: string;
};

let timer: number | null = null;
let initialized = false;

function mapRow(row: SelectTimeEntry): TimeEntry {
  return {
    id: row.id,
    clockInAt: row.clock_in,
    clockOutAt: row.clock_out,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function refreshTimeEntries() {
  const rows = await listTimeEntries();
  timeState.entries = rows.map(mapRow);
}

export async function initTimeState() {
  if (initialized) return;
  await refreshTimeEntries();
  timeState.hydrated = true;
  initialized = true;
}

export const timeState = $state({
  entries: [] as TimeEntry[],
  nowMs: Date.now(),
  hydrated: false,
});

export function startClock() {
  if (timer !== null) return;
  timer = window.setInterval(() => (timeState.nowMs = Date.now()), 1000);
}

export function stopClock() {
  if (timer === null) return;
  window.clearInterval(timer);
  timer = null;
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

export function toTimeInputValue(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function parseTimeInput(
  value: string,
): { hours: number; minutes: number } | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value.trim());
  if (!match) return null;
  return { hours: Number(match[1]), minutes: Number(match[2]) };
}

export function combineDayKeyAndTime(
  dayKey: string,
  timeValue: string,
): string | null {
  const parsed = parseTimeInput(timeValue);
  if (!parsed) return null;
  const [year, month, day] = dayKey.split("-").map(Number);
  if (!year || !month || !day) return null;
  // Local wall-clock -> absolute UTC ISO
  const local = new Date(
    year,
    month - 1,
    day,
    parsed.hours,
    parsed.minutes,
    0,
    0,
  );
  if (Number.isNaN(local.getTime())) return null;
  return local.toISOString();
}
