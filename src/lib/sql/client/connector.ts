import type { PowerSyncCredentials } from "@powersync/web";
import {
  PUBLIC_POWERSYNC_DEV_TOKEN,
  PUBLIC_POWERSYNC_URL,
} from "$env/static/public";

export class Connector {
  async fetchCredentials(): Promise<PowerSyncCredentials> {
    // Implement fetchCredentials to obtain a JWT from your authentication service
    return {
      endpoint: PUBLIC_POWERSYNC_URL,
      token: PUBLIC_POWERSYNC_DEV_TOKEN,
    };
  }
}
