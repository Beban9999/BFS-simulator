import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { ai, numbersField, range, type ArrayState } from "../../_shared/array";
import { isRotatedSorted, randomRotated, ROTATED_HINT } from "../../_shared/rotated";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  nums: number[];
}

function* generate({ nums }: Input) {
  const t = new Tracer<ArrayState>();
  let lo = 0;
  let hi = nums.length - 1;
  const state = (mid: number | null, result?: number): ArrayState => ({
    rows: [{ values: nums, bars: true }],
    pointers: [{ name: "lo", index: lo }, { name: "hi", index: hi }, ...(mid !== null ? [{ name: "mid", index: mid }] : [])],
    ranges: [{ from: lo, to: hi, kind: "active", label: "[lo, hi]" }],
    result,
  });
  const out = () => hl("pruned", ...range(nums.length).filter((k) => k < lo || k > hi).map((k) => ai(k)));

  yield t.step("init", "The minimum is somewhere in [0, n − 1].", { state: state(null), vars: { lo, hi } });
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    t.count("comparisons");
    yield t.step("compare", `mid = ${mid}: compare nums[mid] = ${nums[mid]} with nums[hi] = ${nums[hi]}.`, {
      state: state(mid),
      vars: { lo, hi, mid },
      highlights: [...out(), ...hl("compare", ai(mid), ai(hi))],
    });
    if (nums[mid] > nums[hi]) {
      lo = mid + 1;
      yield t.step("go-right", `${nums[mid]} > ${nums[hi]}: values drop somewhere after mid, so the minimum is to the right. lo = ${lo}.`, { state: state(null), vars: { lo, hi }, highlights: out() });
    } else {
      hi = mid;
      yield t.step("go-left", `${nums[mid]} ≤ ${nums[hi]}: [mid..hi] is increasing, so the minimum is at mid or to its left. hi = ${hi}.`, { state: state(null), vars: { lo, hi }, highlights: out() });
    }
  }
  yield t.step("done", `lo == hi == ${lo}: the minimum is nums[${lo}] = ${nums[lo]}${lo ? ` (the array was rotated ${lo} place${lo === 1 ? "" : "s"})` : " (not rotated)"}.`, {
    state: state(null, nums[lo]),
    vars: { lo, min: nums[lo] },
    highlights: [...out(), ...hl("found", ai(lo))],
  });
}

const algorithm: AlgorithmModule<Input, ArrayState> = {
  ...meta,
  renderer: "bars",
  inputSchema: { fields: [numbersField("nums", "nums (rotated sorted, distinct)", { minLength: 1 })], validate: ({ nums }) => (isRotatedSorted(nums) ? null : ROTATED_HINT) },
  presets: [
    { name: "LeetCode example", input: { nums: [3, 4, 5, 1, 2] } },
    { name: "Longer rotation", input: { nums: [4, 5, 6, 7, 0, 1, 2] } },
    { name: "Edge case: not rotated", input: { nums: [11, 13, 15, 17] } },
    { name: "Edge case: rotated by n − 1", input: { nums: [2, 3, 4, 5, 6, 7, 1] } },
  ],
  randomInput: (size, rng = Math.random) => ({ nums: randomRotated(rng, size) }),
  code: { python, javascript },
  generate,
  reference: ({ nums }) => Math.min(...nums),
  outputOf: (s) => s.result,
  info,
  legendLabels: { pruned: "Ruled out", compare: "nums[mid] vs nums[hi]", found: "Minimum", active: "Search range" },
};

export default algorithm;
