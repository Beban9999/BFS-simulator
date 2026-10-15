import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { numbersField } from "../../_shared/array";
import { tc, type DPState } from "../../_shared/dp";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  weights: number[];
  values: number[];
  capacity: number;
}

const FORMULA = "dp[i][w] = max( dp[i−1][w] (leave),  dp[i−1][w − wt] + val (take, if wt ≤ w) )";

function* generate({ weights, values, capacity: W }: Input) {
  const t = new Tracer<DPState>();
  const n = weights.length;
  const dp: (number | null)[][] = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: W + 1 }, () => (i === 0 ? 0 : null)));
  const picked: number[] = [];
  const state = (arrows: DPState["arrows"] = [], result?: unknown): DPState => ({
    formula: FORMULA,
    table: {
      rows: dp,
      rowLabels: ["no items", ...weights.map((wt, k) => `#${k} w${wt} v${values[k]}`)],
      colLabels: Array.from({ length: W + 1 }, (_, w) => String(w)),
    },
    arrows,
    caption: `capacity ${W} · columns = capacity w${picked.length ? ` · packed items: ${picked.slice().reverse().map((k) => `#${k}`).join(", ")}` : ""}`,
    result,
  });

  yield t.step("init", "Row 0 uses no items, so every capacity is worth 0. Add the items one row at a time.", { state: state(), vars: { n, W }, highlights: hl("found", ...Array.from({ length: W + 1 }, (_, w) => tc(0, w))) });

  for (let i = 1; i <= n; i++) {
    const wt = weights[i - 1];
    const val = values[i - 1];
    for (let w = 0; w <= W; w++) {
      const leave = dp[i - 1][w]!;
      t.count("comparisons");
      if (wt > w) {
        dp[i][w] = leave;
        yield t.step("skip", `Item #${i - 1} (weight ${wt}) doesn't fit in capacity ${w}: leave it → ${leave}.`, {
          state: state([{ from: [i - 1, w], to: [i, w] }]),
          vars: { i, w, wt, val, leave },
          highlights: [...hl("found", tc(i - 1, w)), ...hl("current", tc(i, w))],
        });
        continue;
      }
      const take = dp[i - 1][w - wt]! + val;
      dp[i][w] = Math.max(leave, take);
      t.count("writes");
      yield t.step(
        take > leave ? "take" : "skip",
        `Capacity ${w}: leave → ${leave}; take → dp[${i - 1}][${w - wt}] + ${val} = ${take}. ${take > leave ? "Take it" : "Leave it"}: ${dp[i][w]}.`,
        {
          state: state([
            { from: [i - 1, w], to: [i, w] },
            { from: [i - 1, w - wt], to: [i, w] },
          ]),
          vars: { i, w, wt, val, leave, take },
          highlights: [...hl("compare", take > leave ? tc(i - 1, w) : tc(i - 1, w - wt)), ...hl("found", take > leave ? tc(i - 1, w - wt) : tc(i - 1, w)), ...hl("current", tc(i, w))],
        },
      );
    }
  }

  let w = W;
  const path: [number, number][] = [[n, W]];
  for (let i = n; i > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      picked.push(i - 1);
      yield t.step("pick", `dp[${i}][${w}] = ${dp[i][w]} ≠ dp[${i - 1}][${w}] = ${dp[i - 1][w]}: item #${i - 1} was taken. Capacity left: ${w} − ${weights[i - 1]} = ${w - weights[i - 1]}.`, {
        state: state([{ from: [i - 1, w - weights[i - 1]], to: [i, w] }]),
        vars: { i, w },
        highlights: hl("path", ...path.map(([a, b]) => tc(a, b))),
      });
      w -= weights[i - 1];
    } else {
      yield t.step("pick", `dp[${i}][${w}] equals the cell above: item #${i - 1} was left out.`, { state: state(), vars: { i, w }, highlights: hl("path", ...path.map(([a, b]) => tc(a, b))) });
    }
    path.push([i - 1, w]);
  }
  const items = picked.slice().reverse();
  const best = dp[n][W]!;
  yield t.step("done", `Best value ${best} with items ${items.length ? items.map((k) => `#${k}`).join(", ") : "(none)"} (weight ${items.reduce((s, k) => s + weights[k], 0)} of ${W}).`, {
    state: state([], best),
    vars: { best },
    highlights: [...hl("path", ...path.map(([a, b]) => tc(a, b))), ...hl("found", tc(n, W))],
  });
}

function reference({ weights, values, capacity }: Input): number {
  let best = 0;
  for (let m = 0; m < 1 << weights.length; m++) {
    let wt = 0;
    let val = 0;
    weights.forEach((x, k) => {
      if ((m >> k) & 1) {
        wt += x;
        val += values[k];
      }
    });
    if (wt <= capacity) best = Math.max(best, val);
  }
  return best;
}

const algorithm: AlgorithmModule<Input, DPState> = {
  ...meta,
  renderer: "dptable",
  inputSchema: {
    fields: [
      numbersField("weights", "weights", { minLength: 0, maxLength: 5, min: 1, max: 10 }),
      numbersField("values", "values", { minLength: 0, maxLength: 5, min: 0, max: 99 }),
      { key: "capacity", label: "capacity W", kind: "number", integer: true, min: 0, max: 10 },
    ],
    validate: ({ weights, values }) => (weights.length !== values.length ? "weights and values need the same length." : null),
  },
  presets: [
    { name: "Classic: 4 items, W = 7", input: { weights: [1, 3, 4, 5], values: [1, 4, 5, 7], capacity: 7 } },
    { name: "Greedy by ratio fails (10 vs 12)", input: { weights: [5, 4, 3], values: [10, 7, 5], capacity: 7 } },
    { name: "Edge case: nothing fits", input: { weights: [6, 7], values: [5, 9], capacity: 5 } },
    { name: "Edge case: no items", input: { weights: [], values: [], capacity: 4 } },
  ],
  randomInput: (size, rng = Math.random) => {
    const n = randInt(rng, 0, Math.min(4, size));
    return { weights: Array.from({ length: n }, () => randInt(rng, 1, 5)), values: Array.from({ length: n }, () => randInt(rng, 1, 9)), capacity: randInt(rng, 0, 8) };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (state) => state.result,
  info,
  legendLabels: { current: "Cell being filled", found: "Option chosen", compare: "Option rejected", path: "Walk back" },
};

export default algorithm;
