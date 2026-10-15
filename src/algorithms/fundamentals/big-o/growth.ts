/** Growth functions for the Big-O note. Values are plain doubles; huge ones are handled in log10 space. */

export interface GrowthClass {
  id: string;
  label: string;
  /** Operation count at n (may be Infinity for huge n; use log10 for those). */
  f: (n: number) => number;
  /** log10 of the operation count, finite for every n ≥ 1. */
  log10: (n: number) => number;
  example: string;
  page?: string;
}

/** ln(n!) by summing for small n and Stirling's series for large n. */
export function lnFactorial(n: number): number {
  if (n < 2) return 0;
  if (n < 200) {
    let s = 0;
    for (let k = 2; k <= n; k++) s += Math.log(k);
    return s;
  }
  return n * Math.log(n) - n + 0.5 * Math.log(2 * Math.PI * n) + 1 / (12 * n);
}

const LN10 = Math.LN10;
const log2 = (n: number) => Math.log2(Math.max(n, 1));

export const CLASSES: GrowthClass[] = [
  { id: "1", label: "O(1)", f: () => 1, log10: () => 0, example: "index an array, push / pop, hash lookup", page: "two-sum-hash" },
  { id: "logn", label: "O(log n)", f: (n) => Math.max(1, log2(n)), log10: (n) => Math.log10(Math.max(1, log2(n))), example: "halve the range each step", page: "binary-search" },
  { id: "n", label: "O(n)", f: (n) => n, log10: (n) => Math.log10(n), example: "one pass over the input", page: "kadane" },
  { id: "nlogn", label: "O(n log n)", f: (n) => n * Math.max(1, log2(n)), log10: (n) => Math.log10(n * Math.max(1, log2(n))), example: "sorting, divide & conquer", page: "merge-sort" },
  { id: "n2", label: "O(n²)", f: (n) => n * n, log10: (n) => 2 * Math.log10(n), example: "all pairs: two nested loops", page: "bubble-sort" },
  { id: "2n", label: "O(2ⁿ)", f: (n) => 2 ** n, log10: (n) => n * Math.log10(2), example: "every subset", page: "subsets" },
  { id: "nfact", label: "O(n!)", f: (n) => Math.exp(lnFactorial(n)), log10: (n) => lnFactorial(n) / LN10, example: "every ordering", page: "permutations" },
];

const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
const sup = (k: number) => String(k).replace(/\d/g, (d) => SUP[Number(d)]);

/** Readable operation count from its log10: "1,000", "1.2 × 10⁹", "≈ 10¹⁵⁶⁵". */
export function formatOps(log10: number): string {
  if (log10 < 6) return Math.round(10 ** log10).toLocaleString("en-US");
  if (log10 < 300) {
    const e = Math.floor(log10);
    const m = 10 ** (log10 - e);
    // 9.996 rounds up to 10.0 — move it to the next power.
    if (m >= 9.95) return `1.0 × 10${sup(e + 1)}`;
    return `${m.toFixed(1)} × 10${sup(e)}`;
  }
  return `≈ 10${sup(Math.floor(log10))}`;
}

const UNITS: [number, string][] = [
  [1e-6, "µs"],
  [1e-3, "ms"],
  [1, "s"],
  [60, "min"],
  [3600, "h"],
  [86400, "days"],
  [31557600, "years"],
];

/** Time at `perSecond` simple operations per second, from log10 of the operation count. */
export function formatTime(log10: number, perSecond = 1e8): string {
  const secLog = log10 - Math.log10(perSecond);
  if (secLog < -6) return "< 1 µs";
  // 4.3 × 10¹⁷ s is the age of the universe.
  if (secLog > 17.6) return "longer than the universe has existed";
  const sec = 10 ** secLog;
  let unit = UNITS[0];
  for (const u of UNITS) if (sec >= u[0]) unit = u;
  const v = sec / unit[0];
  return `${v < 10 ? v.toFixed(1) : Math.round(v).toLocaleString("en-US")} ${unit[1]}`;
}
