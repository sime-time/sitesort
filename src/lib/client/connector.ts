import type {
  AbstractPowerSyncDatabase,
  CrudEntry,
  PowerSyncBackendConnector,
  PowerSyncCredentials,
} from "@powersync/web";
import { PUBLIC_POWERSYNC_URL } from "$env/static/public";
import { getErrorCode } from "$lib/utils/error-handling";
import { authClient } from "./auth";

interface UploadResponse {
  ok: boolean;
  message?: string;
  errorCode?: string;
}

// Postgres Response codes that we cannot recover from by retrying.
const FATAL_RESPONSE_CODES = [
  // Class 23 — Integrity Constraint Violation.
  // Examples include NOT NULL, FOREIGN KEY and UNIQUE violations.
  /^23...$/,
  // INSUFFICIENT PRIVILEGE - typically a row-level security violation
  /^42501$/,
];

function isFatalResponse(code: string): boolean {
  return FATAL_RESPONSE_CODES.some((regex) => regex.test(code));
}

export class Connector implements PowerSyncBackendConnector {
  private async getSessionToken(): Promise<string> {
    const { data, error } = await authClient.getSession();
    if (error || !data?.session?.token) {
      throw new Error(
        `Missing auth credentials: ${error?.message ?? "no session token"}`,
      );
    }
    return data.session.token;
  }

  async fetchCredentials(): Promise<PowerSyncCredentials> {
    const token = await this.getSessionToken();

    return {
      endpoint: PUBLIC_POWERSYNC_URL,
      token: token,
    } satisfies PowerSyncCredentials;
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    const transaction = await database.getNextCrudTransaction();
    if (!transaction) return;

    let lastOp: CrudEntry | null = null;

    try {
      const token = await this.getSessionToken();

      if (transaction.crud.length > 0) {
        lastOp = transaction.crud[transaction.crud.length - 1] ?? null;
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ crud: transaction.crud }),
      });

      const body = (await response
        .json()
        .catch(() => null)) as UploadResponse | null;

      // Success path
      if (response.ok && body?.ok !== false) {
        await transaction.complete();
        return;
      }

      // Retryable path
      if (response.status >= 500) {
        throw new Error(`Data upload failed with ${response.status}`);
      }

      // Non-retryable path: don't block queue forever
      const code = body?.errorCode;
      const fatalCode = code ? isFatalResponse(code) : false;

      if (response.ok) {
        if (body?.ok === false) {
          if (fatalCode) {
            // Discard only explicit fatal issue
            await transaction.complete();
          }
          throw new Error(body?.message ?? "Upload rejected");
        }

        await transaction.complete();
        return;
      }

      // Unknown path: non-2xx safest is retry
      throw new Error(
        body?.message ?? `Unexpected upload error ${response.status}`,
      );
    } catch (err) {
      const code = getErrorCode(err);
      const isFatalCode = code ? isFatalResponse(code) : false;

      if (isFatalCode) {
        console.error("Data upload fatal error - discarding:", lastOp, err);
        await transaction.complete();
        return;
      }

      // Throw so PowerSync retries later
      throw err;
    }
  }
}
