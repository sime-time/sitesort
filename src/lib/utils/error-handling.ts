// Go-style result tuple for error handling
// [data, null] on success
// [null, error] on failure

export type Result<T, E extends { reason: string }> = [T, null] | [null, E];

// Create success result
export function ok<T>(data: T): Result<T, never> {
  return [data, null];
}

// Create error result
export function err<E extends { reason: string }>(error: E): Result<never, E> {
  return [null, error];
}

export function getErrorCode(err: unknown): string | null {
  if (typeof err === "object" && err !== null && "code" in err) {
    const code = (err as { code?: unknown }).code;
    return typeof code === "string" ? code : null;
  }
  return null;
}
