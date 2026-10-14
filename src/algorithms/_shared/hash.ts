export interface HashState {
  mode: "chaining" | "probing";
  /** Chaining: a list per bucket. Probing: [] (empty) or [key] per slot. */
  buckets: string[][];
  /** Text describing the current hash computation, e.g. "hash('cat') = 98262 → 98262 % 8 = 6". */
  hashLine?: string;
  /** Previous table shown while rehashing. */
  old?: string[][];
  size: number;
  result?: unknown;
}

/** Highlight id of a bucket / of entry j inside bucket i. */
export const bi = (i: number, old = false) => `${old ? "old" : "b"}:${i}`;
export const ei = (i: number, j: number) => `e:${i}:${j}`;

/** Polynomial rolling string hash (base 31), kept in 32 bits so the numbers stay readable. */
export function stringHash(key: string): number {
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}
