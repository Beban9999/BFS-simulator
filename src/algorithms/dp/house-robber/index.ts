import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { numbersField, randomNumbers } from "../../_shared/array";
import { tc, type DPState } from "../../_shared/dp";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  nums: number[];
}

const FORMULA = "dp[i] = max( dp[i−1] (skip),  dp[i−2] + nums[i] (rob) )";

function* generate({ nums }: Input) {
  const t = new Tracer<DPState>();
  const n = nums.length;
  const dp: (number | null)[] = Array(n).fill(null);
  const picked: number[] = [];

  // Row 0 = nums, row 1 = dp.
  const state = (arrows: DPState["arrows"] = [], result?: unknown): DPState => ({
    formula: FORMULA,
    table: { rows: [nums, dp], rowLabels: ["nums", "dp"], colLabels: nums.map((_, i) => String(i)) },
    arrows,
    caption: picked.length ? `robbed houses: ${picked.slice().sort((a, b) => a - b).join(", ")}` : undefined,
    result,
  });

  if (n === 0) {
    yield t.step("empty", "No houses: the answer is 0.", { state: { formula: FORMULA, result: { best: 0, houses: [] } }, vars: {} });
    return;
  }

  dp[0] = nums[0];
  t.count("writes");
  yield t.step("base0", `Only house 0 exists in the first prefix: dp[0] = nums[0] = ${nums[0]}.`, {
    state: state([{ from: [0, 0], to: [1, 0] }]),
    vars: { i: 0, "dp[0]": dp[0] },
    highlights: hl("current", tc(1, 0)),
  });
  if (n > 1) {
    dp[1] = Math.max(nums[0], nums[1]);
    t.count("writes");
    yield t.step("base1", `With two houses you can rob only one: dp[1] = max(${nums[0]}, ${nums[1]}) = ${dp[1]}.`, {
      state: state([
        { from: [0, 0], to: [1, 1] },
        { from: [0, 1], to: [1, 1] },
      ]),
      vars: { i: 1, "dp[1]": dp[1] },
      highlights: [...hl("current", tc(1, 1)), ...hl("found", tc(0, nums[1] >= nums[0] ? 1 : 0))],
    });
  }
  for (let i = 2; i < n; i++) {
    const skip = dp[i - 1]!;
    const take = dp[i - 2]! + nums[i];
    dp[i] = Math.max(skip, take);
    t.count("comparisons");
    t.count("writes");
    const robbed = take > skip;
    yield t.step(
      "fill",
      `House ${i} (${nums[i]}): skip → dp[${i - 1}] = ${skip}; rob → dp[${i - 2}] + ${nums[i]} = ${take}. ${take === skip ? "Tie" : robbed ? "Robbing wins" : "Skipping wins"}: dp[${i}] = ${dp[i]}.`,
      {
        state: state([
          { from: [1, i - 1], to: [1, i] },
          { from: [1, i - 2], to: [1, i] },
          { from: [0, i], to: [1, i] },
        ]),
        vars: { i, skip, take, "dp[i]": dp[i] },
        highlights: [...hl("compare", robbed ? tc(1, i - 1) : tc(1, i - 2), ...(robbed ? [] : [tc(0, i)])), ...hl("found", ...(robbed ? [tc(1, i - 2), tc(0, i)] : [tc(1, i - 1)])), ...hl("current", tc(1, i))],
      },
    );
  }

  // Path reconstruction.
  let i = n - 1;
  while (i >= 0) {
    if (i > 0 && dp[i] === dp[i - 1]) {
      yield t.step("skip", `dp[${i}] = dp[${i - 1}] = ${dp[i]}: house ${i} wasn't needed — skip it.`, {
        state: state(),
        vars: { i },
        highlights: [...hl("path", ...picked.map((p) => tc(0, p))), ...hl("pruned", tc(0, i)), ...hl("current", tc(1, i))],
      });
      i -= 1;
    } else {
      picked.push(i);
      yield t.step("pick", `dp[${i}] = ${dp[i]} ≠ dp[${i - 1 >= 0 ? i - 1 : "-1"}]${i > 0 ? ` = ${dp[i - 1]}` : ""}: house ${i} was robbed. Jump to ${i - 2}.`, {
        state: state(),
        vars: { i },
        highlights: [...hl("path", ...picked.map((p) => tc(0, p))), ...hl("current", tc(1, i))],
      });
      i -= 2;
    }
  }
  const houses = picked.slice().reverse();
  yield t.step("done", `Best loot dp[${n - 1}] = ${dp[n - 1]}, from houses ${houses.join(", ")}.`, {
    state: state([], { best: dp[n - 1], houses }),
    vars: { best: dp[n - 1] },
    highlights: [...hl("path", ...houses.map((p) => tc(0, p))), ...hl("found", tc(1, n - 1))],
  });
}

function reference({ nums }: Input) {
  // Brute force over every non-adjacent subset; ties resolved like the walk-back (prefer skipping later houses).
  const n = nums.length;
  if (!n) return { best: 0, houses: [] };
  const dp: number[] = [];
  nums.forEach((x, i) => (dp[i] = Math.max(i > 0 ? dp[i - 1] : 0, (i > 1 ? dp[i - 2] : 0) + x)));
  let best = 0;
  for (let m = 0; m < 1 << n; m++) {
    if (m & (m >> 1)) continue;
    best = Math.max(best, nums.reduce((s, x, i) => s + ((m >> i) & 1 ? x : 0), 0));
  }
  const houses: number[] = [];
  for (let i = n - 1; i >= 0; ) {
    if (i > 0 && dp[i] === dp[i - 1]) i--;
    else {
      houses.unshift(i);
      i -= 2;
    }
  }
  return { best, houses };
}

const algorithm: AlgorithmModule<Input, DPState> = {
  ...meta,
  renderer: "dptable",
  inputSchema: { fields: [numbersField("nums", "money per house", { minLength: 0, maxLength: 12, min: 0, max: 99 })] },
  presets: [
    { name: "LeetCode example: [2, 7, 9, 3, 1]", input: { nums: [2, 7, 9, 3, 1] } },
    { name: "Greedy trap: [2, 1, 1, 2]", input: { nums: [2, 1, 1, 2] } },
    { name: "Longer street", input: { nums: [5, 3, 4, 11, 2, 8, 6, 1, 9] } },
    { name: "Edge case: one house", input: { nums: [7] } },
    { name: "Edge case: no houses", input: { nums: [] } },
  ],
  randomInput: (size, rng = Math.random) => ({ nums: randomNumbers(rng, Math.min(size + 2, 12), 0, 20, 12) }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (state) => state.result,
  info,
  legendLabels: { current: "Cell being computed", found: "Winning option", compare: "Losing option", path: "Robbed house", pruned: "Skipped house" },
};

export default algorithm;
