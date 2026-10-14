import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { pick } from "../../../engine/random";
import { ai, numbersField, range, sortedNumbers, type ArrayState } from "../../_shared/array";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  nums: number[];
  target: number;
}

function* generate({ nums, target }: Input) {
  const t = new Tracer<ArrayState>();
  let lo = 0;
  let hi = nums.length - 1;
  const state = (mid: number | null, result?: number): ArrayState => ({
    rows: [{ values: nums }],
    pointers: [
      { name: "lo", index: lo },
      { name: "hi", index: hi },
      ...(mid !== null ? [{ name: "mid", index: mid }] : []),
    ],
    ranges: lo <= hi ? [{ from: lo, to: hi, kind: "active", label: `[lo, hi] · ${hi - lo + 1} left` }] : [],
    caption: `target = ${target}`,
    result,
  });
  const out = () => hl("pruned", ...range(nums.length).filter((k) => k < lo || k > hi).map((k) => ai(k)));

  yield t.step("init", `The target, if present, is somewhere in [0, ${nums.length - 1}].`, { state: state(null), vars: { lo, hi } });

  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    t.count("comparisons");
    yield t.step("mid", `mid = (${lo} + ${hi}) // 2 = ${mid}; nums[mid] = ${nums[mid]}.`, {
      state: state(mid),
      vars: { lo, hi, mid, "nums[mid]": nums[mid] },
      highlights: [...out(), ...hl("compare", ai(mid))],
    });
    if (nums[mid] === target) {
      yield t.step("found", `nums[${mid}] = ${target}. Found it.`, { state: state(mid, mid), vars: { lo, hi, mid }, highlights: [...out(), ...hl("found", ai(mid))] });
      return;
    }
    if (nums[mid] < target) {
      lo = mid + 1;
      yield t.step("go-right", `${nums[mid]} < ${target}: everything up to mid is too small. Discard the left half: lo = ${lo}.`, {
        state: state(null),
        vars: { lo, hi, mid },
        highlights: out(),
      });
    } else {
      hi = mid - 1;
      yield t.step("go-left", `${nums[mid]} > ${target}: everything from mid on is too big. Discard the right half: hi = ${hi}.`, {
        state: state(null),
        vars: { lo, hi, mid },
        highlights: out(),
      });
    }
  }
  yield t.step("none", `lo (${lo}) > hi (${hi}): the range is empty, so ${target} is not in the array. Return −1.`, {
    state: state(null, -1),
    vars: { lo, hi },
    highlights: out(),
  });
}

function reference({ nums, target }: Input): number {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}

const algorithm: AlgorithmModule<Input, ArrayState> = {
  ...meta,
  renderer: "array",
  inputSchema: {
    fields: [numbersField("nums", "nums (sorted)", { sorted: true }), { key: "target", label: "target", kind: "number", integer: true, min: -99, max: 99 }],
  },
  presets: [
    { name: "LeetCode example", input: { nums: [-1, 0, 3, 5, 9, 12], target: 9 } },
    { name: "Absent target", input: { nums: [-1, 0, 3, 5, 9, 12], target: 2 } },
    { name: "Worst case: 16 elements, target at the edge", input: { nums: range(16).map((k) => k * 3), target: 45 } },
    { name: "Edge case: single element", input: { nums: [5], target: 5 } },
  ],
  randomInput: (size, rng = Math.random) => {
    const nums = [...new Set(sortedNumbers(rng, size, 0, 40))];
    return { nums, target: rng() < 0.7 ? pick(rng, nums) : 41 };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (s) => s.result,
  info,
  legendLabels: { pruned: "Ruled out", compare: "nums[mid]", active: "Search range" },
};

export default algorithm;
