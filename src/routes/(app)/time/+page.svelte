<script lang="ts">
  import Icon from "@iconify/svelte";
  import { onMount } from "svelte";

  type TimeEntry = {
    id: string;
    clockInAt: string;
    clockOutAt: string | null;
    createdAt: string;
    updatedAt: string;
  };

  const STORAGE_KEY = "sitesort.timeEntries.v1";

  let entries = $state<TimeEntry[]>([]);
  let nowMs = $state<number>(Date.now());
  let isHydrated = $state<boolean>(false);

  let editDialogEl = $state<HTMLDialogElement | null>(null);
  let editingId = $state<string | null>(null);
  let editClockInValue = $state<string>("");
  let editClockOutValue = $state<string>("");
  let editError = $state<string>("");

  const activeEntry = $derived(
    entries.find((entry) => entry.clockOutAt === null),
  );

  const groupedEntries = $derived.by(() => {
    const sorted = [...entries].sort(
      (a, b) =>
        new Date(b.clockInAt).getTime() - new Date(a.clockInAt).getTime() ||
        b.id.localeCompare(a.id),
    );

    const groups = new Map<string, TimeEntry[]>();

    for (const entry of sorted) {
      const key = getLocalDayKey(entry.clockInAt);
      const current = groups.get(key) ?? [];
      current.push(entry);
      groups.set(key, current);
    }

    return Array.from(groups.entries()).map(([key, dayEntries]) => ({
      key,
      label: formatDayHeading(key),
      entries: dayEntries,
    }));
  });

  const activeElapsed = $derived(
    activeEntry
      ? formatDuration(nowMs - new Date(activeEntry.clockInAt).getTime())
      : "",
  );

  const activeStartTime = $derived(
    activeEntry ? formatTimeLabel(activeEntry.clockInAt) : "",
  );

  onMount(() => {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (raw) {
      try {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          entries = parsed
            .filter((item): item is TimeEntry => {
              if (!item || typeof item !== "object") return false;
              const candidate = item as Partial<TimeEntry>;
              return (
                typeof candidate.id === "string" &&
                typeof candidate.clockInAt === "string" &&
                (typeof candidate.clockOutAt === "string" ||
                  candidate.clockOutAt === null) &&
                typeof candidate.createdAt === "string" &&
                typeof candidate.updatedAt === "string"
              );
            })
            .sort(
              (a, b) =>
                new Date(a.clockInAt).getTime() -
                new Date(b.clockInAt).getTime(),
            );
        }
      } catch {
        entries = [];
      }
    }

    isHydrated = true;
  });

  $effect(() => {
    if (!isHydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  });

  $effect(() => {
    if (!activeEntry) return;

    nowMs = Date.now();
    const timer = window.setInterval(() => {
      nowMs = Date.now();
    }, 1000);

    return () => window.clearInterval(timer);
  });

  function handleToggleClock() {
    if (activeEntry) {
      clockOut(activeEntry.id);
      return;
    }
    clockIn();
  }

  function clockIn() {
    const nowIso = new Date().toISOString();

    const newEntry: TimeEntry = {
      id: crypto.randomUUID(),
      clockInAt: nowIso,
      clockOutAt: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    entries = [newEntry, ...entries];
  }

  function clockOut(entryId: string) {
    const nowIso = new Date().toISOString();
    entries = entries.map((entry) => {
      if (entry.id !== entryId) return entry;
      return {
        ...entry,
        clockOutAt: nowIso,
        updatedAt: nowIso,
      };
    });
  }

  function openEdit(entry: TimeEntry) {
    editingId = entry.id;
    editClockInValue = toDatetimeLocalValue(entry.clockInAt);
    editClockOutValue = entry.clockOutAt
      ? toDatetimeLocalValue(entry.clockOutAt)
      : "";
    editError = "";
    editDialogEl?.showModal();
  }

  function closeEdit() {
    editDialogEl?.close();
    editingId = null;
    editClockInValue = "";
    editClockOutValue = "";
    editError = "";
  }

  function saveEdit() {
    if (!editingId) return;

    const nextClockIn = parseLocalDatetime(editClockInValue);
    if (!nextClockIn) {
      editError = "Clock-in time is required";
      return;
    }

    const nextClockOut = editClockOutValue
      ? parseLocalDatetime(editClockOutValue)
      : null;

    if (editClockOutValue && !nextClockOut) {
      editError = "Clock-out time is invalid";
      return;
    }

    if (nextClockOut && nextClockOut < nextClockIn) {
      editError = "Clock-out must be after clock-in";
      return;
    }

    const updatedAt = new Date().toISOString();

    entries = entries.map((entry) => {
      if (entry.id !== editingId) return entry;
      return {
        ...entry,
        clockInAt: nextClockIn,
        clockOutAt: nextClockOut,
        updatedAt,
      };
    });

    closeEdit();
  }

  function deleteEditingEntry() {
    if (!editingId) return;
    entries = entries.filter((entry) => entry.id !== editingId);
    closeEdit();
  }

  function parseLocalDatetime(value: string): string | null {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
  }

  function toDatetimeLocalValue(isoString: string): string {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  function getLocalDayKey(isoString: string): string {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function formatDayHeading(dayKey: string): string {
    const [year, month, day] = dayKey.split("-").map(Number);
    const date = new Date(year, (month || 1) - 1, day || 1);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  }

  function formatTimeLabel(isoString: string): string {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "--";

    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  function formatDuration(milliseconds: number): string {
    const safeMs = Math.max(0, milliseconds);
    const totalSeconds = Math.floor(safeMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function getEntryDuration(entry: TimeEntry): string {
    const clockInMs = new Date(entry.clockInAt).getTime();
    const clockOutMs = entry.clockOutAt
      ? new Date(entry.clockOutAt).getTime()
      : nowMs;

    return formatDuration(clockOutMs - clockInMs);
  }
</script>

<section class="flex-1 min-h-0 flex flex-col p-3 gap-3">
  <div class="card bg-base-100 border border-accent shadow-sm shrink-0">
    <div class="card-body p-4 gap-4">
      <div class="flex items-center justify-between gap-2">
        <h1 class="font-heading font-medium text-2xl uppercase">Time</h1>
        {#if activeEntry}
          <span class="badge badge-success badge-lg uppercase tracking-wide">
            On the Clock
          </span>
        {:else}
          <span class="badge badge-neutral badge-lg uppercase tracking-wide">
            Off the Clock
          </span>
        {/if}
      </div>

      <button
        type="button"
        class={`btn btn-xl w-full font-heading uppercase tracking-widest ${
          activeEntry ? "btn-error" : "btn-primary"
        }`}
        onclick={handleToggleClock}
      >
        <Icon
          icon={activeEntry
              ? "material-symbols:pause-circle-outline"
              : "material-symbols:play-circle-outline"}
          class="size-6"
        />
        <span>{activeEntry ? "Clock Out" : "Clock In"}</span>
      </button>

      {#if activeEntry}
        <div class="alert alert-info py-2">
          <Icon icon="material-symbols:timer-outline" class="size-5" />
          <div class="flex flex-col">
            <span class="font-semibold">{activeElapsed}</span>
            <span class="text-sm">Since {activeStartTime}</span>
          </div>
        </div>
      {:else}
        <p class="text-sm text-base-content/70">
          Clock in when work starts. Clock out for breaks and end of day.
        </p>
      {/if}
    </div>
  </div>

  <div
    class="flex-1 min-h-0 overflow-y-auto overscroll-contain pb-16 no-scrollbar"
  >
    {#if groupedEntries.length === 0}
      <div class="card bg-base-100 border border-dashed border-accent">
        <div class="card-body items-center text-center py-8">
          <Icon
            icon="material-symbols:nest-clock-farsight-analog-outline"
            class="size-10 text-base-content/50"
          />
          <p class="font-medium">No time entries yet</p>
          <p class="text-sm text-base-content/70">
            Tap Clock In to start tracking.
          </p>
        </div>
      </div>
    {:else}
      {#each groupedEntries as dayGroup (dayGroup.key)}
        <section class="mb-4">
          <h2
            class="text-xs uppercase tracking-widest font-semibold text-base-content/60 mb-2"
          >
            {dayGroup.label}
          </h2>

          <div class="flex flex-col gap-2">
            {#each dayGroup.entries as entry (entry.id)}
              <button
                type="button"
                class="card bg-base-100 border border-accent shadow-sm text-left"
                onclick={() => openEdit(entry)}
              >
                <div class="card-body p-4 gap-2">
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <p class="font-medium text-base">
                        {formatTimeLabel(entry.clockInAt)}
                        -
                        {entry.clockOutAt ? formatTimeLabel(entry.clockOutAt) : "Running"}
                      </p>
                      <p class="text-sm text-base-content/65">
                        {entry.clockOutAt ? "Completed shift" : "Open shift"}
                      </p>
                    </div>
                    <div class="badge badge-outline">
                      {getEntryDuration(entry)}
                    </div>
                  </div>

                  <div class="card-actions justify-end text-primary">
                    <span class="text-xs uppercase tracking-widest font-medium">
                      Edit
                    </span>
                    <Icon
                      icon="material-symbols:chevron-right"
                      class="size-5"
                    />
                  </div>
                </div>
              </button>
            {/each}
          </div>
        </section>
      {/each}
    {/if}
  </div>
</section>

<dialog bind:this={editDialogEl} class="modal" onclose={closeEdit}>
  <div class="modal-box w-11/12 max-w-md">
    <h3 class="font-bold text-lg">Edit Time Entry</h3>

    <div class="mt-4 flex flex-col gap-3">
      <fieldset class="fieldset">
        <label class="label" for="clock-in-input">Clock In</label>
        <input
          id="clock-in-input"
          type="datetime-local"
          class="input input-bordered w-full"
          bind:value={editClockInValue}
        >
      </fieldset>

      <fieldset class="fieldset">
        <label class="label" for="clock-out-input">Clock Out</label>
        <input
          id="clock-out-input"
          type="datetime-local"
          class="input input-bordered w-full"
          bind:value={editClockOutValue}
        >
        <p class="label text-base-content/65">
          Leave empty to keep it running.
        </p>
      </fieldset>

      {#if editError}
        <p class="text-error text-sm">{editError}</p>
      {/if}
    </div>

    <div class="modal-action justify-between">
      <button
        type="button"
        class="btn btn-error btn-soft"
        onclick={deleteEditingEntry}
      >
        <Icon icon="material-symbols:delete-outline" class="size-5" />
        Delete
      </button>

      <div class="flex gap-2">
        <form method="dialog">
          <button type="submit" class="btn">Cancel</button>
        </form>
        <button type="button" class="btn btn-primary" onclick={saveEdit}>
          Save
        </button>
      </div>
    </div>
  </div>

  <form method="dialog" class="modal-backdrop">
    <button type="submit">close</button>
  </form>
</dialog>
