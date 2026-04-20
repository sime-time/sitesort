import { wrapPowerSyncWithDrizzle } from "@powersync/drizzle-driver";
import {
  PowerSyncDatabase,
  WASQLiteOpenFactory,
  WASQLiteVFS,
} from "@powersync/web";
import { Connector } from "./connector";
import { AppSchema, drizzleSchema } from "./schema";

export const powerSyncDb = new PowerSyncDatabase({
  schema: AppSchema,
  database: new WASQLiteOpenFactory({
    dbFilename: "sitesort.sqlite",
    vfs: WASQLiteVFS.OPFSCoopSyncVFS,
    flags: { enableMultiTabs: typeof SharedWorker !== "undefined" },
  }),
  flags: {
    enableMultiTabs: typeof SharedWorker !== "undefined",
  },
});

export const db = wrapPowerSyncWithDrizzle(powerSyncDb, {
  schema: drizzleSchema,
});

let initPromise: Promise<void> | null = null;
let connectPromise: Promise<void> | null = null;
let connector: Connector | null = null;

export async function initPowerSyncLocal(): Promise<void> {
  if (powerSyncDb.ready) return;

  if (!initPromise) {
    initPromise = powerSyncDb.init().catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  await initPromise;
}

export async function setupPowerSync(): Promise<void> {
  await initPowerSyncLocal();
  if (powerSyncDb.connected) return;

  if (!connectPromise) {
    if (!connector) {
      connector = new Connector();
    }

    connectPromise = powerSyncDb.connect(connector).catch((err) => {
      connectPromise = null;
      throw err;
    });
  }
  await connectPromise;
}
