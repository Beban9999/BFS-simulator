import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { ai, numbersField, randomNumbers, range, type ArrayState, type Range } from "../../_shared/array";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  nums: number[];
  k: number;
}

function* generate({ nums, k }: Input) {
  const t = new Tracer<ArrayState>();
  let window = 0;
  for (let i = 0; i < k; i++) window += nums[i];
  t.count("accesses", k);
  let best = window;
  let bestStart = 0;
  const state = (right: number, result?: number): ArrayState => {
    const ranges: Range[] = [
      { from: bestStart, to: bestStart + k - 1, kind: "found", label: `best = ${best}` },
      { from: right - k + 1, to: right, kind: "window", label: `sum = ${window}` },
    ];
    return { rows: [{ values: nums }], pointers: [{ name: "left", index: right - k + 1 }, { name: "right", index: right }], ranges, caption: `k = ${k}`, result };
  };
  const inWindow = (right: number) => hl("window", ...range(k).map((d) => ai(right - k + 1 + d)));

  yield t.step("init", `Sum the first window nums[0..${k - 1}] = ${window}. best = ${best}.`, {
    state: state(k - 1),
    vars: { window, best },
    highlights: inWindow(k - 1),
  });

  for (let right = k; right < nums.length; right++) {
    const out = nums[right - k];
    window += nums[right] - out;
    t.count("accesses", 2);
    yield t.step("slide", `Slide right: add nums[${right}] = ${nums[right]}, remove nums[${right - k}] = ${out} → window = ${window}.`, {
      state: state(right),
      vars: { right, "in": nums[right], out, window, best },
      highlights: [...inWindow(right), ...hl("removed", ai(right - k)), ...hl("current", ai(right))],
    });
    t.count("comparisons");
    if (window > best) {
      best = window;
      bestStart = right - k + 1;
      yield t.step("update", `${window} beats the best so far: best = ${best}.`, {
        state: state(right),
        vars: { right, window, best },
        highlights: hl("found", ...range(k).map((d) => ai(bestStart + d))),
      });
    }
  }

  yield t.step("done", `Maximum sum of ${k} consecutive elements = ${best} (indexes ${bestStart}..${bestStart + k - 1}).`, {
    state: state(Math.max(k - 1, nums.length - 1), best),
    vars: { best },
    highlights: hl("found", ...range(k).map((d) => ai(bestStart + d))),
  });
}

function reference({ nums, k }: Input): number {
  let best = -Infinity;
  for (let i = 0; i + k <= nums.length; i++) best = Math.max(best, nums.slice(i, i + k).reduce((a, b) => a + b, 0));
  return best;
}

const algorithm: AlgorithmModule<Input, ArrayState> = {
  ...meta,
  renderer: "array",
  inputSchema: {
    fields: [numbersField("nums", "nums", { minLength: 1 }), { key: "k", label: "k (window size)", kind: "number", integer: true, min: 1, max: 16 }],
    validate: ({ nums, k }) => (k > nums.length ? `k must be at most the array length (${nums.length}).` : null),
  },
  presets: [
    { name: "LeetCode-style example", input: { nums: [1, 12, -5, -6, 50, 3], k: 4 } },
    { name: "Window of 3", input: { nums: [2, 1, 5, 1, 3, 2, 9, 1, 2], k: 3 } },
    { name: "Edge case: k = n", input: { nums: [4, -1, 2], k: 3 } },
    { name: "Edge case: all negative", input: { nums: [-4, -2, -7, -1, -3], k: 2 } },
  ],
  randomInput: (size, rng = Math.random) => {
    const nums = randomNumbers(rng, size, -9, 9);
    return { nums, k: randInt(rng, 1, nums.length) };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (s) => s.result,
  info,
  legendLabels: { window: "Current window", removed: "Leaving the window", current: "Entering the window", found: "Best window" },
};

export default algorithm;
