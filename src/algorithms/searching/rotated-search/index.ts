import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { pick } from "../../../engine/random";
import { ai, numbersField, range, type ArrayState, type Range } from "../../_shared/array";
import { isRotatedSorted, randomRotated, ROTATED_HINT } from "../../_shared/rotated";
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
  const state = (mid: number | null, extra: Range[] = [], result?: number): ArrayState => ({
    rows: [{ values: nums, bars: true }],
    pointers: [{ name: "lo", index: lo }, { name: "hi", index: hi }, ...(mid !== null ? [{ name: "mid", index: mid }] : [])],
    ranges: [...(lo <= hi ? [{ from: lo, to: hi, kind: "active" as const, label: "[lo, hi]" }] : []), ...extra],
    caption: `target = ${target}`,
    result,
  });
  const out = () => hl("pruned", ...range(nums.length).filter((k) => k < lo || k > hi).map((k) => ai(k)));

  yield t.step("init", "Search [0, n − 1]. The array is two sorted runs glued together.", { state: state(null), vars: { lo, hi } });

  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    t.count("comparisons");
    if (nums[mid] === target) {
      yield t.step("found", `nums[${mid}] = ${target}. Found.`, { state: state(mid, [], mid), vars: { lo, hi, mid }, highlights: [...out(), ...hl("found", ai(mid))] });
      return;
    }
    yield t.step("mid", `mid = ${mid}, nums[mid] = ${nums[mid]} ≠ ${target}.`, {
      state: state(mid),
      vars: { lo, hi, mid, "nums[mid]": nums[mid] },
      highlights: [...out(), ...hl("compare", ai(mid))],
    });
    if (nums[lo] <= nums[mid]) {
      const sorted: Range = { from: lo, to: mid, kind: "sorted", label: "sorted half" };
      const inside = nums[lo] <= target && target < nums[mid];
      yield t.step("left-sorted", `nums[lo] = ${nums[lo]} ≤ nums[mid] = ${nums[mid]}, so the left half [${lo}..${mid}] is sorted. Is ${nums[lo]} ≤ ${target} < ${nums[mid]}? ${inside ? "Yes." : "No."}`, {
        state: state(mid, [sorted]),
        vars: { lo, hi, mid },
        highlights: [...out(), ...hl("sorted", ...range(mid - lo + 1).map((k) => ai(lo + k)))],
      });
      if (inside) {
        hi = mid - 1;
        yield t.step("go-left", `The target can only be in the sorted left half: hi = ${hi}.`, { state: state(null), vars: { lo, hi }, highlights: out() });
      } else {
        lo = mid + 1;
        yield t.step("go-right", `Not in the sorted left half, so search the right: lo = ${lo}.`, { state: state(null), vars: { lo, hi }, highlights: out() });
      }
    } else {
      const sorted: Range = { from: mid, to: hi, kind: "sorted", label: "sorted half" };
      const inside = nums[mid] < target && target <= nums[hi];
      yield t.step("right-sorted", `nums[lo] = ${nums[lo]} > nums[mid] = ${nums[mid]}: the pivot is on the left, so the right half [${mid}..${hi}] is sorted. Is ${nums[mid]} < ${target} ≤ ${nums[hi]}? ${inside ? "Yes." : "No."}`, {
        state: state(mid, [sorted]),
        vars: { lo, hi, mid },
        highlights: [...out(), ...hl("sorted", ...range(hi - mid + 1).map((k) => ai(mid + k)))],
      });
      if (inside) {
        lo = mid + 1;
        yield t.step("go-right2", `The target can only be in the sorted right half: lo = ${lo}.`, { state: state(null), vars: { lo, hi }, highlights: out() });
      } else {
        hi = mid - 1;
        yield t.step("go-left2", `Not in the sorted right half, so search the left: hi = ${hi}.`, { state: state(null), vars: { lo, hi }, highlights: out() });
      }
    }
  }
  yield t.step("none", `The range is empty: ${target} is not in the array.`, { state: state(null, [], -1), vars: { lo, hi }, highlights: out() });
}

const algorithm: AlgorithmModule<Input, ArrayState> = {
  ...meta,
  renderer: "bars",
  inputSchema: {
    fields: [numbersField("nums", "nums (rotated sorted, distinct)", { minLength: 1 }), { key: "target", label: "target", kind: "number", integer: true, min: -99, max: 99 }],
    validate: ({ nums }) => (isRotatedSorted(nums) ? null : ROTATED_HINT),
  },
  presets: [
    { name: "LeetCode example", input: { nums: [4, 5, 6, 7, 0, 1, 2], target: 0 } },
    { name: "Absent target", input: { nums: [4, 5, 6, 7, 0, 1, 2], target: 3 } },
    { name: "Pivot near the end", input: { nums: [3, 5, 8, 11, 14, 17, 20, 23, 1], target: 1 } },
    { name: "Edge case: not rotated", input: { nums: [1, 3, 5, 7, 9], target: 7 } },
  ],
  randomInput: (size, rng = Math.random) => {
    const nums = randomRotated(rng, size);
    return { nums, target: rng() < 0.75 ? pick(rng, nums) : 41 };
  },
  code: { python, javascript },
  generate,
  reference: ({ nums, target }) => nums.indexOf(target),
  outputOf: (s) => s.result,
  info,
  legendLabels: { sorted: "Sorted half", pruned: "Ruled out", compare: "mid", active: "Search range" },
};

export default algorithm;
