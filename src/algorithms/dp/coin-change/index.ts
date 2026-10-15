import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { numbersField } from "../../_shared/array";
import { cell, tc, type DPState } from "../../_shared/dp";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  coins: number[];
  amount: number;
}

const FORMULA = "dp[a] = 1 + min over coins c ≤ a of dp[a − c]";

function* generate({ coins, amount }: Input) {
  const t = new Tracer<DPState>();
  const dp: number[] = [0, ...Array(amount).fill(Infinity)];
  const as = Array.from({ length: amount + 1 }, (_, a) => a);
  const used: number[] = [];

  const state = (arrows: DPState["arrows"] = [], result?: unknown): DPState => ({
    formula: FORMULA,
    table: { rows: [as, dp.map(cell)], rowLabels: ["amount", "dp"] },
    arrows,
    caption: `coins ${coins.join(", ")}${used.length ? ` · coins used: ${used.join(" + ")}` : ""}`,
    result,
  });

  yield t.step("init", `dp[0] = 0 (no coins for amount 0); every other amount starts at ∞.`, { state: state(), vars: { amount }, highlights: hl("found", tc(1, 0)) });

  for (let a = 1; a <= amount; a++) {
    const options = coins.filter((c) => c <= a);
    let best = Infinity;
    let bestCoin: number | null = null;
    for (const c of options) {
      t.count("comparisons");
      if (dp[a - c] + 1 < best) {
        best = dp[a - c] + 1;
        bestCoin = c;
      }
    }
    const parts = options.map((c) => `${c} → dp[${a - c}] + 1 = ${dp[a - c] === Infinity ? "∞" : dp[a - c] + 1}`);
    dp[a] = best;
    if (best < Infinity) t.count("writes");
    yield t.step(
      best < Infinity ? "improve" : "try",
      options.length === 0
        ? `Amount ${a}: every coin is bigger than ${a}. dp[${a}] stays ∞.`
        : best === Infinity
          ? `Amount ${a}: ${parts.join("; ")}. None reachable, dp[${a}] stays ∞.`
          : `Amount ${a}: ${parts.join("; ")}. Best uses coin ${bestCoin}: dp[${a}] = ${best}.`,
      {
        state: state(options.map((c) => ({ from: [1, a - c] as [number, number], to: [1, a] as [number, number] }))),
        vars: { a, "dp[a]": cell(best) },
        highlights: [
          ...hl("compare", ...options.filter((c) => c !== bestCoin).map((c) => tc(1, a - c))),
          ...(bestCoin !== null ? hl("found", tc(1, a - bestCoin)) : []),
          ...hl("current", tc(1, a)),
        ],
      },
    );
  }

  if (dp[amount] === Infinity) {
    yield t.step("done", `dp[${amount}] is ∞: the amount can't be made from these coins. Return -1.`, { state: state([], -1), vars: { result: -1 }, highlights: hl("mismatch", tc(1, amount)) });
    return;
  }
  const path: number[] = [];
  for (let a = amount; a > 0; ) {
    const c = coins.find((x) => x <= a && dp[a - x] === dp[a] - 1)!;
    used.push(c);
    path.push(a);
    yield t.step("trace", `dp[${a}] = ${dp[a]} came from coin ${c} (dp[${a - c}] = ${dp[a - c]}). Step back to amount ${a - c}.`, {
      state: state([{ from: [1, a - c], to: [1, a] }]),
      vars: { a, coin: c },
      highlights: [...hl("path", ...path.map((p) => tc(1, p))), ...hl("current", tc(1, a - c))],
    });
    a -= c;
  }
  yield t.step("done", `Fewest coins for ${amount}: ${dp[amount]} (${used.join(" + ")}).`, { state: state([], dp[amount]), vars: { result: dp[amount] }, highlights: hl("path", ...path.map((p) => tc(1, p)), tc(1, 0)) });
}

function reference({ coins, amount }: Input): number {
  // BFS over amounts: the first time we reach `amount` uses the fewest coins.
  const seen = new Set([0]);
  let frontier = [0];
  for (let steps = 0; frontier.length; steps++) {
    if (frontier.includes(amount)) return steps;
    const next: number[] = [];
    for (const x of frontier)
      for (const c of coins)
        if (x + c <= amount && !seen.has(x + c)) {
          seen.add(x + c);
          next.push(x + c);
        }
    frontier = next;
  }
  return -1;
}

const algorithm: AlgorithmModule<Input, DPState> = {
  ...meta,
  renderer: "dptable",
  inputSchema: {
    fields: [numbersField("coins", "coins", { minLength: 1, maxLength: 4, min: 1, max: 20 }), { key: "amount", label: "amount", kind: "number", integer: true, min: 0, max: 15 }],
    validate: ({ coins }) => (new Set(coins).size < coins.length ? "Coins must be distinct." : null),
  },
  presets: [
    { name: "LeetCode example: [1, 2, 5], 11", input: { coins: [1, 2, 5], amount: 11 } },
    { name: "Greedy fails: [1, 3, 4], 6", input: { coins: [1, 3, 4], amount: 6 } },
    { name: "Edge case: impossible ([2], 3)", input: { coins: [2], amount: 3 } },
    { name: "Edge case: amount 0", input: { coins: [1], amount: 0 } },
    { name: "Gaps: [5, 7], 12", input: { coins: [5, 7], amount: 12 } },
  ],
  randomInput: (size, rng = Math.random) => {
    const coins = [...new Set(Array.from({ length: randInt(rng, 1, 3) }, () => randInt(rng, 1, 7)))];
    return { coins, amount: randInt(rng, 0, Math.min(15, size + 4)) };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (state) => state.result,
  info,
  legendLabels: { current: "Amount being computed", found: "Best look-back", compare: "Other options", path: "Coins used (walk back)", mismatch: "Unreachable" },
};

export default algorithm;
