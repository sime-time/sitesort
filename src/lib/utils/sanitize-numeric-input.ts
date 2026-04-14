export function clampMin(n: number) {
  return Math.max(0, n);
}

export function sanitizeWholeNumber(value: string) {
  const digitsOnly = value.replace(/\D/g, "");
  return digitsOnly === "" ? 0 : Number(digitsOnly);
}

export function blockInvalidKeys(event: KeyboardEvent) {
  if (["e", "E", "+", "-", "."].includes(event.key)) {
    event.preventDefault();
  }
}
