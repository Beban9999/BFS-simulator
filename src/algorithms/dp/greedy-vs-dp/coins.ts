/** Coin change, greedy vs DP — pure helpers for the greedy-vs-dp note (tested in coins.test.ts). */

/** Largest coin first. Returns the coins used, or null when it gets stuck with a remainder. */
export function greedyCoins(coins: number[], amount: number): number[] | null {
  const out: number[] = [];
  let left = amount;
  for (const c of coins.slice().sort((a, b) => b - a)) {
    while (left >= c) {
      out.push(c);
      left -= c;
    }
  }
  return left === 0 ? out : null;
}

/** Fewest coins via the bottom-up table; returns one optimal multiset (largest coins first) or null. */
export function dpCoins(coins: number[], amount: number): number[] | null {
  const INF = Number.MAX_SAFE_INTEGER;
  const best = new Array<number>(amount + 1).fill(INF);
  const last = new Array<number>(amount + 1).fill(0);
  best[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a && best[a - c] + 1 < best[a]) {
        best[a] = best[a - c] + 1;
        last[a] = c;
      }
    }
  }
  if (best[amount] === INF) return null;
  const out: number[] = [];
  for (let a = amount; a > 0; a -= last[a]) out.push(last[a]);
  return out.sort((x, y) => y - x);
}

export type Verdict = "same" | "worse" | "stuck" | "impossible";

export function compare(coins: number[], amount: number): Verdict {
  const d = dpCoins(coins, amount);
  if (!d) return "impossible";
  const g = greedyCoins(coins, amount);
  if (!g) return "stuck";
  return g.length === d.length ? "same" : "worse";
}

/** Parse "1, 3, 4" into distinct positive integers ≤ 100, at most 8 of them. */
export function parseCoins(text: string): number[] | string {
  const parts = text.split(/[\s,]+/).filter(Boolean);
  if (!parts.length) return "Enter at least one coin.";
  const nums = parts.map(Number);
  if (nums.some((x) => !Number.isInteger(x) || x < 1 || x > 100)) return "Coins must be whole numbers from 1 to 100.";
  const set = [...new Set(nums)].sort((a, b) => a - b);
  if (set.length > 8) return "At most 8 different coins.";
  return set;
}

export interface CoinPreset {
  name: string;
  coins: number[];
  amount: number;
  expect: Verdict;
}

/** Plain literals; coins.test.ts checks each verdict. */
export const PRESETS: CoinPreset[] = [
  { name: "Greedy uses more coins", coins: [1, 3, 4], amount: 6, expect: "worse" },
  { name: "Greedy gets stuck", coins: [2, 5], amount: 6, expect: "stuck" },
  { name: "US coins (greedy is safe)", coins: [1, 5, 10, 25], amount: 63, expect: "same" },
  { name: "Big gap", coins: [1, 6, 9], amount: 12, expect: "worse" },
  { name: "No answer at all", coins: [3, 7], amount: 5, expect: "impossible" },
];
