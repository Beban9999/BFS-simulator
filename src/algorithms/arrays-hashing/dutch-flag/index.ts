import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { ai, numbersField, range, type ArrayState, type Range } from "../../_shared/array";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  nums: number[];
}

function* generate({ nums: input }: Input) {
  const t = new Tracer<ArrayState>();
  const nums = input.slice();
  const ids = range(nums.length);
  let low = 0;
  let mid = 0;
  let high = nums.length - 1;

  const swap = (a: number, b: number) => {
    [nums[a], nums[b]] = [nums[b], nums[a]];
    [ids[a], ids[b]] = [ids[b], ids[a]];
    t.count("swaps");
  };
  const state = (result?: number[]): ArrayState => {
    const ranges: Range[] = [];
    if (low > 0) ranges.push({ from: 0, to: low - 1, kind: "found", label: "0s" });
    if (mid > low) ranges.push({ from: low, to: mid - 1, kind: "active", label: "1s" });
    if (high < nums.length - 1) ranges.push({ from: high + 1, to: nums.length - 1, kind: "window", label: "2s" });
    return {
      rows: [{ values: nums.slice(), ids: ids.slice() }],
      pointers: [
        { name: "low", index: low },
        { name: "mid", index: mid },
        { name: "high", index: high },
      ],
      ranges,
      result,
    };
  };
  const vars = () => ({ low, mid, high, "nums[mid]": mid <= high ? nums[mid] : "—" });

  yield t.step("init", "low = mid = 0 and high = n − 1. Everything between mid and high is still unknown.", {
    state: state(),
    vars: vars(),
  });

  while (mid <= high) {
    t.count("comparisons");
    if (nums[mid] === 0) {
      yield t.step("check", `nums[mid] = 0 belongs in the 0 zone.`, { state: state(), vars: vars(), highlights: hl("current", ai(mid)) });
      const a = low;
      const b = mid;
      swap(low, mid);
      low++;
      mid++;
      yield t.step("swap-low", `Swap it to index ${a}, the end of the 0 zone. What comes back is a 1 (or the same 0 when low = mid), so low and mid both advance.`, {
        state: state(),
        vars: vars(),
        highlights: hl("swap", ai(a), ai(b)),
      });
    } else if (nums[mid] === 1) {
      mid++;
      yield t.step("skip", `nums[${mid - 1}] = 1 is already in the middle zone: just advance mid.`, {
        state: state(),
        vars: vars(),
        highlights: hl("current", ai(mid - 1)),
      });
    } else {
      yield t.step("check", `nums[mid] = 2 belongs in the 2 zone at the end.`, { state: state(), vars: vars(), highlights: hl("current", ai(mid)) });
      const b = high;
      swap(mid, high);
      high--;
      yield t.step("swap-high", `Swap it with index ${b} and shrink high. Don't advance mid — the value now at mid (${nums[mid]}) hasn't been examined.`, {
        state: state(),
        vars: vars(),
        highlights: hl("swap", ai(mid), ai(b)),
      });
    }
  }

  yield t.step("done", `mid passed high: the array is partitioned into 0s, 1s and 2s → [${nums.join(", ")}].`, {
    state: state(nums.slice()),
    vars: vars(),
    highlights: hl("sorted", ...range(nums.length).map((k) => ai(k))),
  });
}

const algorithm: AlgorithmModule<Input, ArrayState> = {
  ...meta,
  renderer: "array",
  inputSchema: { fields: [numbersField("nums", "nums (0, 1, 2 only)", { min: 0, max: 2 })] },
  presets: [
    { name: "LeetCode example", input: { nums: [2, 0, 2, 1, 1, 0] } },
    { name: "Many 2s up front", input: { nums: [2, 2, 2, 1, 0, 0, 1, 2, 0] } },
    { name: "Edge case: already sorted", input: { nums: [0, 0, 1, 1, 2, 2] } },
    { name: "Edge case: single value", input: { nums: [1] } },
  ],
  randomInput: (size, rng = Math.random) => ({ nums: Array.from({ length: Math.max(1, Math.min(16, size)) }, () => randInt(rng, 0, 2)) }),
  code: { python, javascript },
  generate,
  reference: ({ nums }) => nums.slice().sort((a, b) => a - b),
  outputOf: (s) => s.result,
  info,
  legendLabels: { found: "0 zone", active: "1 zone", window: "2 zone", sorted: "Sorted" },
};

export default algorithm;
