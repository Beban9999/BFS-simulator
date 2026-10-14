import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { ai, numbersField, randomNumbers, type ArrayState, type Range } from "../../_shared/array";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  nums: number[];
}

function* generate({ nums }: Input) {
  const t = new Tracer<ArrayState>();
  let best = nums[0];
  let cur = nums[0];
  let start = 0;
  let bestL = 0;
  let bestR = 0;

  const snap = (i: number, result?: number) => {
    const ranges: Range[] = [
      { from: bestL, to: bestR, kind: "found", label: `best = ${best}` },
      { from: start, to: i, kind: "window", label: `cur = ${cur}` },
    ];
    return {
      state: { rows: [{ values: nums }], pointers: [{ name: "i", index: i }, { name: "start", index: start }], ranges, result },
      vars: { i, "nums[i]": nums[i], cur, best, "best range": `[${bestL}..${bestR}]` },
    };
  };

  yield t.step("init", `Start with the first element: cur = best = ${nums[0]}.`, {
    ...snap(0),
    highlights: hl("current", ai(0)),
  });

  for (let i = 1; i < nums.length; i++) {
    t.count("comparisons");
    if (cur < 0) {
      yield t.step("check", `cur = ${cur} is negative, so any subarray that extends it is worse than starting fresh at index ${i}.`, {
        ...snap(i - 1),
        highlights: hl("compare", ai(i)),
      });
      cur = nums[i];
      start = i;
      yield t.step("restart", `Restart: cur = nums[${i}] = ${nums[i]}, new subarray starts at ${i}.`, {
        ...snap(i),
        highlights: hl("current", ai(i)),
      });
    } else {
      cur += nums[i];
      yield t.step("extend", `cur ≥ 0 helps, so extend: cur += ${nums[i]} → ${cur}.`, {
        ...snap(i),
        highlights: hl("current", ai(i)),
      });
    }
    t.count("comparisons");
    if (cur > best) {
      best = cur;
      bestL = start;
      bestR = i;
      yield t.step("update", `cur = ${cur} beats the best so far: best = ${best} on [${bestL}..${bestR}].`, {
        ...snap(i),
        highlights: hl("found", ...Array.from({ length: bestR - bestL + 1 }, (_, k) => ai(bestL + k))),
      });
    }
  }

  yield t.step("done", `Done. The maximum subarray sum is ${best}, from index ${bestL} to ${bestR}.`, {
    ...snap(nums.length - 1, best),
    highlights: hl("found", ...Array.from({ length: bestR - bestL + 1 }, (_, k) => ai(bestL + k))),
  });
}

function reference({ nums }: Input): number {
  let best = nums[0];
  let cur = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]);
    best = Math.max(best, cur);
  }
  return best;
}

const algorithm: AlgorithmModule<Input, ArrayState> = {
  ...meta,
  renderer: "array",
  inputSchema: { fields: [numbersField("nums", "nums", { minLength: 1 })] },
  presets: [
    { name: "LeetCode example", input: { nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] } },
    { name: "Edge case: all negative", input: { nums: [-3, -1, -4, -2] } },
    { name: "Edge case: single element", input: { nums: [7] } },
    { name: "Many restarts", input: { nums: [2, -3, 4, -5, 6, -7, 8, -1, 3] } },
  ],
  randomInput: (size, rng = Math.random) => ({ nums: randomNumbers(rng, size, -9, 9) }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (s) => s.result,
  info,
  legendLabels: { found: "Best subarray", window: "Current subarray" },
  legendExtra: ["window"],
};

export default algorithm;
