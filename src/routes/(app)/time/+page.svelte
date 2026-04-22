<script lang="ts">
  import Icon from "@iconify/svelte";
  import chevronRightIcon from "@iconify-icons/material-symbols/chevron-right";
  import deleteOutlineIcon from "@iconify-icons/material-symbols/delete-outline";
  import nestClockFarsightAnalogOutlineIcon from "@iconify-icons/material-symbols/nest-clock-farsight-analog-outline";
  import pauseCircleOutlineIcon from "@iconify-icons/material-symbols/pause-circle-outline";
  import playCircleOutlineIcon from "@iconify-icons/material-symbols/play-circle-outline";
  import timerOutlineIcon from "@iconify-icons/material-symbols/timer-outline";
  import { toast } from "svelte-sonner";
  import {
    closeOpenEntry,
    createClockIn,
    deleteTimeEntry,
    findOpenEntry,
    updateTimeEntry,
  } from "$lib/client/crud/time-entries";
  import { haptic } from "$lib/utils/haptic";
  import {
    combineDayKeyAndTime,
    formatDayHeading,
    formatDuration,
    formatTimeLabel,
    getEntryDuration,
    getLocalDayKey,
    refreshTimeEntries,
    type TimeEntry,
    timeState,
    toTimeInputValue,
  } from "$lib/utils/time-state.svelte";

  let editDialogEl = $state<HTMLDialogElement | null>(null);
  let editingId = $state<string | null>(null);
  let editClockInValue = $state<string>("");
  let editClockOutValue = $state<string>("");
  let editError = $state<string>("");
  let editingDayKey = $state<string>("");
  let toggleInFlight = $state(false);

  const activeEntry = $derived(
    timeState.entries.find((entry) => entry.clockOutAt === null),
  );

  const activeElapsed = $derived(
    activeEntry
      ? formatDuration(
          timeState.nowMs - new Date(activeEntry.clockInAt).getTime(),
        )
      : "",
  );

  const activeStartTime = $derived(
    activeEntry ? formatTimeLabel(activeEntry.clockInAt) : "",
  );

  const activeClockIcon = $derived(
    activeEntry ? pauseCircleOutlineIcon : playCircleOutlineIcon,
  );

  const groupedEntries = $derived.by(() => {
    const sorted = [...timeState.entries].sort(
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

  function getErrorMessage(error: unknown, fallback: string): string {
    return error instanceof Error && error.message ? error.message : fallback;
  }

  async function handleToggleClock() {
    if (toggleInFlight) return;
    toggleInFlight = true;
    haptic.confirm();
    try {
      if (activeEntry) {
        await clockOut(activeEntry.id);
        return;
      }
      await clockIn();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update clock status"));
    } finally {
      toggleInFlight = false;
    }
  }

  async function clockIn() {
    const openEntry = await findOpenEntry();
    if (openEntry) {
      await refreshTimeEntries();
      return;
    }

    const nowIso = new Date().toISOString();
    await createClockIn(nowIso);
    await refreshTimeEntries();
  }

  async function clockOut(entryId: string) {
    const nowIso = new Date().toISOString();
    await closeOpenEntry(entryId, nowIso);
    await refreshTimeEntries();
  }

  function openEdit(entry: TimeEntry) {
    haptic();
    editingId = entry.id;
    editingDayKey = getLocalDayKey(entry.clockInAt);
    editClockInValue = toTimeInputValue(entry.clockInAt);
    editClockOutValue = entry.clockOutAt
      ? toTimeInputValue(entry.clockOutAt)
      : "";
    editError = "";
    editDialogEl?.showModal();
  }

  function closeEdit() {
    haptic();
    editDialogEl?.close();
    editingId = null;
    editClockInValue = "";
    editClockOutValue = "";
    editError = "";
    editingDayKey = "";
  }

  async function saveEdit() {
    if (!editingId) return;

    const nextClockIn = combineDayKeyAndTime(editingDayKey, editClockInValue);
    if (!nextClockIn) {
      editError = "Clock-in time is required";
      return;
    }

    const nextClockOut = editClockOutValue
      ? combineDayKeyAndTime(editingDayKey, editClockOutValue)
      : null;

    if (editClockOutValue && !nextClockOut) {
      editError = "Clock-out time is invalid";
      return;
    }

    if (nextClockOut) {
      const clockInTime = new Date(nextClockIn).getTime();
      const clockOutTime = new Date(nextClockOut).getTime();
      if (clockOutTime < clockInTime) {
        editError = "Clock-out must be after clock-in";
        return;
      }
    }

    try {
      await updateTimeEntry(editingId, nextClockIn, nextClockOut);
      await refreshTimeEntries();
      closeEdit();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save time entry"));
    }
  }

  async function deleteEditingEntry() {
    if (!editingId) return;

    try {
      await deleteTimeEntry(editingId);
      await refreshTimeEntries();
      closeEdit();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete time entry"));
    }
  }
</script>

<section class="flex-1 min-h-0 flex flex-col p-3 pb-1 gap-3">
  <div class="card bg-white border border-accent shrink-0">
    <div class="card-body p-4 gap-4">
      <div class="flex items-center justify-between gap-2">
        <h1 class="font-heading font-medium text-2xl uppercase">Time</h1>
        {#if activeEntry}
          <span
            class="badge badge-success badge-soft badge-lg uppercase tracking-wide"
          >
            On the Clock
          </span>
        {:else}
          <span
            class="badge badge-neutral badge-soft badge-lg uppercase tracking-wide"
          >
            Off the Clock
          </span>
        {/if}
      </div>

      <button
        type="button"
        disabled={toggleInFlight}
        class={`btn btn-xl w-full font-heading uppercase tracking-widest ${
          activeEntry ? "btn-error" : "btn-primary"
        }`}
        onclick={handleToggleClock}
      >
        <Icon icon={activeClockIcon} class="size-6" />
        <span>{activeEntry ? "Clock Out" : "Clock In"}</span>
      </button>

      {#if activeEntry}
        <div class="alert alert-info alert-soft py-2 min-h-15">
          <Icon icon={timerOutlineIcon} class="size-5" />
          <div class="flex flex-col">
            <span class="font-semibold">{activeElapsed}</span>
            <span class="text-sm">Since {activeStartTime}</span>
          </div>
        </div>
      {:else}
        <div class="min-h-15 flex items-center">
          <p class="text-sm text-base-content/70">
            Clock in when work starts. <br>
            Clock out for breaks and end of day.
          </p>
        </div>
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
            icon={nestClockFarsightAnalogOutlineIcon}
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

          <div class="flex flex-col">
            {#each dayGroup.entries as entry (entry.id)}
              <button
                type="button"
                class="card bg-white border-b border-accent text-left"
                onclick={() => openEdit(entry)}
              >
                <div class="card-body p-4 gap-2">
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <p class="font-medium text-base">
                        {formatTimeLabel(entry.clockInAt)}
                        -
                        {#if entry.clockOutAt}
                          {formatTimeLabel(entry.clockOutAt)}
                        {:else}
                          <i>Running</i>
                          <span class="loading loading-dots loading-xs"></span>
                        {/if}
                      </p>
                      <p class="text-sm text-base-content/65">
                        {entry.clockOutAt ? "Completed shift" : "Open shift"}
                      </p>
                    </div>
                    <div class="badge badge-info badge-soft">
                      {getEntryDuration(entry)}
                    </div>
                  </div>

                  <div class="card-actions justify-end text-primary">
                    <span class="text-xs uppercase tracking-widest font-medium">
                      Edit
                    </span>
                    <Icon icon={chevronRightIcon} class="size-5" />
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

<dialog bind:this={editDialogEl} class="modal modal-middle" onclose={closeEdit}>
  <div class="modal-box">
    <h3 class="font-heading font-semibold text-lg uppercase tracking-wider">
      Edit Time Entry
    </h3>

    <div class="mt-4 flex flex-col gap-3">
      <fieldset class="fieldset">
        <label class="label" for="clock-in-input">Clock In</label>
        <input
          id="clock-in-input"
          type="time"
          class="input input-bordered w-full"
          bind:value={editClockInValue}
        >
      </fieldset>

      <fieldset class="fieldset">
        <label class="label" for="clock-out-input">Clock Out</label>
        <input
          id="clock-out-input"
          type="time"
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
        class="btn btn-error btn-soft font-heading uppercase tracking-wider"
        onclick={deleteEditingEntry}
      >
        <Icon icon={deleteOutlineIcon} class="size-5" />
        Delete
      </button>

      <div class="flex gap-2">
        <form method="dialog">
          <button
            type="submit"
            class="btn font-heading uppercase tracking-wider"
          >
            Cancel
          </button>
        </form>
        <button
          type="button"
          class="btn btn-primary font-heading uppercase tracking-wider"
          onclick={saveEdit}
        >
          Save
        </button>
      </div>
    </div>
  </div>

  <form method="dialog" class="modal-backdrop">
    <button type="submit">close</button>
  </form>
</dialog>
