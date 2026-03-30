import { wrapPowerSyncWithDrizzle } from "@powersync/drizzle-driver";
import { PowerSyncDatabase } from "@powersync/web";
import { AppSchema, drizzleSchema } from "./schema";

const powerSyncDb = new PowerSyncDatabase({
  schema: AppSchema,
  database: {
    dbFilename: "sitesort.sqlite",
  },
});

export const db = wrapPowerSyncWithDrizzle(powerSyncDb, {
  schema: drizzleSchema,
});
