import { wrapPowerSyncWithDrizzle } from "@powersync/drizzle-driver";
import { PowerSyncDatabase } from "@powersync/web";
import { Connector } from "./connector";
import { AppSchema, drizzleSchema } from "./schema";

// Avoid duplicate connect calls
let isPowerSyncConnected = false;
let connectPromise: Promise<void> | null = null;

const powerSyncDb = new PowerSyncDatabase({
  schema: AppSchema,
  database: {
    dbFilename: "sitesort.sqlite",
  },
});

export const db = wrapPowerSyncWithDrizzle(powerSyncDb, {
  schema: drizzleSchema,
});

export const setupPowerSync = async () => {
  if (isPowerSyncConnected) return;
  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    const connector = new Connector();
    powerSyncDb.connect(connector);
    isPowerSyncConnected = true;
  })();

  try {
    await connectPromise;
  } finally {
    connectPromise = null;
  }
};
