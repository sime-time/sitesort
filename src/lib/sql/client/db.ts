import { wrapPowerSyncWithDrizzle } from "@powersync/drizzle-driver";
import { PowerSyncDatabase } from "@powersync/web";
import { Connector } from "./connector";
import { AppSchema, drizzleSchema } from "./schema";

export const powerSyncDb = new PowerSyncDatabase({
  schema: AppSchema,
  database: {
    dbFilename: "sitesort.sqlite",
  },
});

export const db = wrapPowerSyncWithDrizzle(powerSyncDb, {
  schema: drizzleSchema,
});

export async function setupPowerSync(): Promise<void> {
  const connector = new Connector();
  powerSyncDb.connect(connector);
}
