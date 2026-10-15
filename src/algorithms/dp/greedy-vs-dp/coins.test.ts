import { describe, expect, it } from "vitest";
import { compare, dpCoins, greedyCoins, parseCoins, PRESETS } from "./coins";

/** Brute force: fewest coins by BFS over amounts. */
function fewest(coins: number[], amount: number): number {
  const dist = new Map<number, number>([[0, 0]]);
  let frontier = [0];
  while (frontier.length) {
    const next: number[] = [];
    for (const a of frontier) {
      if (a === amount) return dist.get(a)!;
      for (const c of coins) {
        if (a + c <= amount && !dist.has(a + c)) {
          dist.set(a + c, dist.get(a)! + 1);
          next.push(a + c);
        }
      }
    }
    frontier = next;
  }
  return -1;
}

describe("greedy-vs-dp coins", () => {
  it("dpCoins is optimal and sums to the amount; greedy is valid when it answers", () => {
    for (const coins of [[1, 3, 4], [2, 5], [1, 5, 10, 25], [3, 7], [1, 6, 9]]) {
      for (let amount = 0; amount <= 60; amount++) {
        const d = dpCoins(coins, amount);
        const f = fewest(coins, amount);
        if (f < 0) expect(d).toBeNull();
        else {
          expect(d!.length).toBe(f);
          expect(d!.reduce((s, x) => s + x, 0)).toBe(amount);
        }
        const g = greedyCoins(coins, amount);
        if (g) expect(g.reduce((s, x) => s + x, 0)).toBe(amount);
      }
    }
  });

  it("presets show what their names promise", () => {
    for (const p of PRESETS) expect(compare(p.coins, p.amount), p.name).toBe(p.expect);
  });

  it("parses coin lists", () => {
    expect(parseCoins("4, 1 3 3")).toEqual([1, 3, 4]);
    expect(typeof parseCoins("0, 2")).toBe("string");
  });
});
