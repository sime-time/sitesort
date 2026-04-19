// sqlite makes booleans 0 or 1
// so they must be normalized before uploading to postgres
export function normalizeBool(value: unknown): boolean | undefined {
  if (value === 0) return false;
  if (value === 1) return true;
  return undefined;
}
