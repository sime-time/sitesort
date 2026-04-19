import { wrapPowerSyncWithDrizzle } from "@powersync/drizzle-driver";
import { PowerSyncDatabase } from "@powersync/web";
import { Connector } from "./connector";
import { AppSchema, drizzleSchema } from "./schema";

export const powerSyncDb = new PowerSyncDatabase({
  schema: AppSchema,
  database: { dbFilename: "sitesort.sqlite" },
});

export const db = wrapPowerSyncWithDrizzle(powerSyncDb, {
  schema: drizzleSchema,
});

const connector = new Connector();

let connectPromise: Promise<void> | null = null;
let connected = false;
let pauseRequested = false;

export function isPowerSyncConnected() {
  return connected;
}

export async function setupPowerSync(): Promise<void> {
  if (connected) return;
  if (connectPromise) return connectPromise;

  // new online session, clear stale pause flag
  pauseRequested = false;

  connectPromise = (async () => {
    try {
      await powerSyncDb.connect(connector);
      connected = true;
      // offline happened while connect was in-flight
      if (pauseRequested) {
        await powerSyncDb.disconnect();
        connected = false;
        pauseRequested = false;
      }
    } finally {
      connectPromise = null;
    }
  })();

  return connectPromise;
}
export async function pausePowerSync(): Promise<void> {
  // if connect still in-flight, request pause after it settles
  if (connectPromise) {
    pauseRequested = true;
    try {
      await connectPromise;
    } catch {
      // ignore connect errors
    }
    return;
  }
  if (!connected) return;
  await powerSyncDb.disconnect();
  connected = false;
  pauseRequested = false;
}
