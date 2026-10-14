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
  const n = nums.length;
  let first = -1;
  let upper = -1;

  function* bound(kind: "lb" | "ub") {
    const ok = (i: number) => (kind === "lb" ? nums[i] >= target : nums[i] > target);
    const predLabel = kind === "lb" ? `nums[i] ≥ ${target}?` : `nums[i] > ${target}?`;
    const name = kind === "lb" ? "lower_bound" : "upper_bound";
    let lo = 0;
    let hi = n;
    const state = (mid: number | null): ArrayState => ({
      rows: [
        { label: "nums", values: nums },
        { label: predLabel, values: nums.map((_, i) => (ok(i) ? "✓" : "✗")), hideIndex: true },
      ],
      pointers: [
        { name: "lo", index: lo },
        { name: "hi", index: hi },
        ...(mid !== null ? [{ name: "mid", index: mid }] : []),
      ],
      ranges: lo < hi ? [{ from: lo, to: hi - 1, kind: "active", label: "[lo, hi)" }] : [],
      caption: `${name}(target = ${target})${first >= 0 ? ` · first = ${first}` : ""}`,
    });
    const known = () => [
      ...hl("mismatch", ...range(lo).map((k) => ai(k, 1))),
      ...hl("match", ...range(n - hi).map((k) => ai(hi + k, 1))),
      ...hl("pruned", ...range(n).filter((k) => k < lo || k >= hi).map((k) => ai(k))),
    ];

    yield t.step(`${kind}-init`, `${name}: find the first index where "${predLabel}" is ✓. Search the half-open range [0, ${n}).`, {
      state: state(null),
      vars: { lo, hi },
      highlights: known(),
    });
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      t.count("comparisons");
      yield t.step(`${kind}-mid`, `mid = ${mid}: nums[mid] = ${nums[mid]} → ${ok(mid) ? "✓" : "✗"}.`, {
        state: state(mid),
        vars: { lo, hi, mid, "nums[mid]": nums[mid] },
        highlights: [...known(), ...hl("compare", ai(mid), ai(mid, 1))],
      });
      if (ok(mid)) {
        hi = mid;
        yield t.step(`${kind}-left`, `✓ at mid, so the first ✓ is at mid or before it: hi = ${hi} (keep mid in play).`, { state: state(null), vars: { lo, hi }, highlights: known() });
      } else {
        lo = mid + 1;
        yield t.step(`${kind}-right`, `✗ at mid, so the first ✓ is after it: lo = ${lo}.`, { state: state(null), vars: { lo, hi }, highlights: known() });
      }
    }
    yield t.step(`${kind}-done`, `lo == hi == ${lo}: ${lo === n ? "no ✓ at all (past the end)" : `the first ✓ is index ${lo}`}.`, {
      state: state(null),
      vars: { [name]: lo },
      highlights: [...known(), ...(lo < n ? hl("found", ai(lo)) : [])],
    });
    return lo;
  }

  first = yield* bound("lb");
  const show = (res: number[]): ArrayState => ({
    rows: [{ label: "nums", values: nums }],
    caption: `target = ${target}`,
    ranges: res[0] >= 0 ? [{ from: res[0], to: res[1], kind: "found", label: `[${res.join(", ")}]` }] : [],
    result: res,
  });
  if (first === n || nums[first] !== target) {
    yield t.step("absent", `lower_bound = ${first} ${first === n ? "is past the end" : `holds ${nums[first]} ≠ ${target}`}: the target is absent. Return [-1, -1].`, {
      state: show([-1, -1]),
      vars: { first },
    });
    return;
  }
  yield t.step("first", `nums[${first}] = ${target}: the first occurrence is ${first}. Now find where the copies end.`, {
    state: { ...show([first, first]), result: undefined },
    vars: { first },
    highlights: hl("found", ai(first)),
  });
  upper = yield* bound("ub");
  yield t.step("last", `upper_bound = ${upper}, so the last occurrence is ${upper} − 1 = ${upper - 1}. Answer [${first}, ${upper - 1}] (${upper - first} cop${upper - first === 1 ? "y" : "ies"}).`, {
    state: show([first, upper - 1]),
    vars: { first, last: upper - 1 },
    highlights: hl("found", ...range(upper - first).map((k) => ai(first + k))),
  });
}

function reference({ nums, target }: Input): number[] {
  return [nums.indexOf(target), nums.lastIndexOf(target)];
}

const algorithm: AlgorithmModule<Input, ArrayState> = {
  ...meta,
  renderer: "array",
  inputSchema: {
    fields: [numbersField("nums", "nums (sorted)", { sorted: true }), { key: "target", label: "target", kind: "number", integer: true, min: -99, max: 99 }],
  },
  presets: [
    { name: "LeetCode example", input: { nums: [5, 7, 7, 8, 8, 10], target: 8 } },
    { name: "Many copies", input: { nums: [1, 2, 2, 2, 2, 2, 2, 3, 4], target: 2 } },
    { name: "Edge case: absent", input: { nums: [5, 7, 7, 8, 8, 10], target: 6 } },
    { name: "Edge case: target larger than all", input: { nums: [1, 3, 5], target: 9 } },
    { name: "Edge case: empty", input: { nums: [], target: 0 } },
  ],
  randomInput: (size, rng = Math.random) => {
    const nums = sortedNumbers(rng, size, 0, 8);
    return { nums, target: rng() < 0.75 ? pick(rng, nums) : 9 };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (s) => s.result,
  info,
  legendLabels: { mismatch: "Known ✗", match: "Known ✓", pruned: "Outside [lo, hi)", compare: "mid", active: "Search range", found: "Answer" },
};

export default algorithm;
