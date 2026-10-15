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
  mode: "quadratic" | "tails";
}

function* quadratic(nums: number[]) {
  const t = new Tracer<DPState>();
  const n = nums.length;
  const dp: (number | null)[] = Array(n).fill(null);
  const prev: (number | null)[] = Array(n).fill(null);
  const state = (arrows: DPState["arrows"] = [], result?: number): DPState => ({
    formula: "dp[i] = 1 + max( dp[j] : j < i, nums[j] < nums[i] )   (1 if none)",
    table: { rows: [nums, dp, prev.map((p, i) => (dp[i] === null ? null : p === null ? "–" : p))], rowLabels: ["nums", "dp", "prev"], colLabels: nums.map((_, i) => String(i)) },
    arrows,
    result,
  });

  yield t.step("q-init", "Every element alone is an increasing subsequence of length 1. Fill dp left to right.", { state: state(), vars: { n } });
  for (let i = 0; i < n; i++) {
    dp[i] = 1;
    const smaller: number[] = [];
    for (let j = 0; j < i; j++) {
      t.count("comparisons");
      if (nums[j] < nums[i]) {
        smaller.push(j);
        if (dp[j]! + 1 > dp[i]!) {
          dp[i] = dp[j]! + 1;
          prev[i] = j;
        }
      }
    }
    t.count("writes");
    yield t.step(
      prev[i] === null ? "q-try" : "q-take",
      smaller.length === 0
        ? `nums[${i}] = ${nums[i]}: nothing earlier is smaller, so dp[${i}] = 1 (it starts a new subsequence).`
        : `nums[${i}] = ${nums[i]} can follow index${smaller.length === 1 ? "" : "es"} ${smaller.join(", ")} (smaller values). Best is j = ${prev[i]} with dp = ${dp[prev[i]!]}: dp[${i}] = ${dp[i]}.`,
      {
        state: state(smaller.map((j) => ({ from: [1, j] as [number, number], to: [1, i] as [number, number] }))),
        vars: { i, "nums[i]": nums[i], "dp[i]": dp[i], "prev[i]": prev[i] ?? -1 },
        highlights: [...hl("compare", ...smaller.filter((j) => j !== prev[i]).map((j) => tc(1, j))), ...(prev[i] !== null ? hl("found", tc(1, prev[i]!)) : []), ...hl("current", tc(1, i))],
      },
    );
  }
  if (!n) {
    yield t.step("q-best", "Empty input: the LIS has length 0.", { state: state([], 0), vars: { length: 0 } });
    return;
  }
  let end = 0;
  for (let i = 1; i < n; i++) if (dp[i]! > dp[end]!) end = i;
  yield t.step("q-best", `The longest subsequence ends where dp is largest: dp[${end}] = ${dp[end]}. Follow prev back from there.`, { state: state(), vars: { end, length: dp[end] }, highlights: hl("current", tc(1, end)) });
  const path: number[] = [];
  for (let k: number | null = end; k !== null; k = prev[k]) {
    path.push(k);
    yield t.step("q-trace", `Take nums[${k}] = ${nums[k]}${prev[k] === null ? " — no predecessor, this is the start." : `; its predecessor is index ${prev[k]}.`}`, {
      state: state(prev[k] === null ? [] : [{ from: [1, prev[k]!], to: [1, k] }]),
      vars: { k },
      highlights: hl("path", ...path.flatMap((p) => [tc(0, p), tc(1, p)])),
    });
  }
  yield t.step("q-trace", `LIS length ${dp[end]}: ${path.reverse().map((p) => nums[p]).join(", ")}.`, { state: state([], dp[end]!), vars: { length: dp[end] }, highlights: hl("path", ...path.flatMap((p) => [tc(0, p), tc(1, p)])) });
}

function* tailsVersion(nums: number[]) {
  const t = new Tracer<DPState>();
  const tails: number[] = [];
  const state = (i: number | null, result?: number): DPState => ({
    formula: "k = first index with tails[k] ≥ x;  k == len(tails) ? append x : tails[k] = x",
    table: {
      rows: [nums.length ? nums : ["–"], tails.length ? [...tails, ...Array(Math.max(0, nums.length - tails.length)).fill("")] : ["–"]],
      rowLabels: ["nums", "tails"],
      colLabels: nums.map((_, k) => String(k)),
    },
    caption: i === null ? undefined : `x = nums[${i}] = ${nums[i]}`,
    result,
  });
  yield t.step("b-init", "tails starts empty. tails[k] will hold the smallest value that can end an increasing subsequence of length k + 1.", { state: state(null), vars: {} });
  for (let i = 0; i < nums.length; i++) {
    const x = nums[i];
    let lo = 0;
    let hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      t.count("comparisons");
      if (tails[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    if (lo === tails.length) {
      tails.push(x);
      yield t.step("b-append", `x = ${x} is bigger than every tail: it extends the longest subsequence. Append → length ${tails.length}.`, {
        state: state(i),
        vars: { x, k: lo, length: tails.length },
        highlights: [...hl("current", tc(0, i)), ...hl("found", tc(1, lo))],
      });
    } else {
      const old = tails[lo];
      tails[lo] = x;
      yield t.step("b-replace", `Binary search: the first tail ≥ ${x} is tails[${lo}] = ${old}. Replace it with ${x} — a length-${lo + 1} subsequence can now end lower.`, {
        state: state(i),
        vars: { x, k: lo, replaced: old },
        highlights: [...hl("current", tc(0, i)), ...hl("swap", tc(1, lo))],
      });
    }
    t.count("writes");
  }
  yield t.step("b-done", `LIS length = len(tails) = ${tails.length}. (tails = [${tails.join(", ")}] is not necessarily a real subsequence.)`, { state: state(null, tails.length), vars: { length: tails.length } });
}

const generate = ({ nums, mode }: Input) => (mode === "tails" ? tailsVersion(nums) : quadratic(nums));

function reference({ nums }: Input): number {
  // Brute force over all subsequences.
  let best = 0;
  for (let m = 0; m < 1 << nums.length; m++) {
    const sub = nums.filter((_, i) => (m >> i) & 1);
    if (sub.every((x, i) => i === 0 || sub[i - 1] < x)) best = Math.max(best, sub.length);
  }
  return best;
}

const algorithm: AlgorithmModule<Input, DPState> = {
  ...meta,
  renderer: "dptable",
  inputSchema: {
    fields: [
      numbersField("nums", "nums", { minLength: 0, maxLength: 12, min: -999, max: 999 }),
      {
        key: "mode",
        label: "Version",
        kind: "select",
        options: [
          { value: "quadratic", label: "O(n²) dp table" },
          { value: "tails", label: "O(n log n) tails" },
        ],
      },
    ],
  },
  presets: [
    { name: "LeetCode example (O(n²))", input: { nums: [10, 9, 2, 5, 3, 7, 101, 18], mode: "quadratic" } },
    { name: "LeetCode example (tails)", input: { nums: [10, 9, 2, 5, 3, 7, 101, 18], mode: "tails" } },
    { name: "tails is not the answer: [3, 4, 5, 1]", input: { nums: [3, 4, 5, 1], mode: "tails" } },
    { name: "Edge case: decreasing", input: { nums: [5, 4, 3, 2, 1], mode: "quadratic" } },
    { name: "Duplicates (strict): [7, 7, 7, 7]", input: { nums: [7, 7, 7, 7], mode: "quadratic" } },
  ],
  randomInput: (size, rng = Math.random) => ({ nums: randomNumbers(rng, Math.min(size + 1, 12), 0, 20, 12), mode: rng() < 0.5 ? "quadratic" : "tails" }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (state) => state.result,
  info,
  legendLabels: { current: "Element being placed", found: "Best predecessor / new tail", compare: "Other valid predecessors", path: "The subsequence", swap: "Tail replaced" },
};

export default algorithm;
