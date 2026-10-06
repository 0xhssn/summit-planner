export const MAX_ALTITUDE_M = 9000;

export function parseAltitude(value: FormDataEntryValue | null): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0 || n > MAX_ALTITUDE_M) {
    throw new Error(`Altitude must be a whole number between 0 and ${MAX_ALTITUDE_M.toLocaleString("en-US")}m.`);
  }
  return n;
}

export function parseCampName(value: FormDataEntryValue | null): string {
  const name = String(value ?? "").trim();
  if (!name) throw new Error("Camp name is required.");
  return name.slice(0, 120);
}
