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

let connectPromise: Promise<void> | null = null;
let connected = false;
const connector = new Connector();

export function isPowerSyncConnected() {
  return connected;
}

export async function setupPowerSync(): Promise<void> {
  if (connected) return;
  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    try {
      // connect starts sync; keep single in-flight connect
      await powerSyncDb.connect(connector);
      connected = true;
    } finally {
      connectPromise = null;
    }
  })();

  return connectPromise;
}

export async function pausePowerSync(): Promise<void> {
  if (!connected) return;
  await powerSyncDb.disconnect();
  connected = false;
}
