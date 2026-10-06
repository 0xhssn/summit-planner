export function meters(n: number) {
  return `${n.toLocaleString("en-US")}m`;
}

export function signedMeters(n: number) {
  if (n === 0) return "±0m";
  return `${n > 0 ? "+" : "−"}${Math.abs(n).toLocaleString("en-US")}m`;
}
