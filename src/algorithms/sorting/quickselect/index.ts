import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { ai, range, type ArrayState, type Pointer, type Range } from "../../_shared/array";
import { Sortable, randomSortInput, sortField } from "../../_shared/sorting";
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
  const s = new Sortable(nums);
  const n = nums.length;
  const target = n - k;
  let lo = 0;
  let hi = n - 1;
  const discarded = (): Highlight[] => hl("pruned", ...range(n).filter((x) => (x < lo || x > hi) && !s.done.has(x)).map((x) => ai(x)));
  const snap = (pointers: Pointer[], ranges: Range[], highlights: Highlight[], vars: Record<string, unknown>, result?: number) => ({
    state: { ...s.state([...pointers, { name: "target", index: target }], ranges), caption: `k = ${k} → target index n − k = ${target}`, result },
    vars: { ...vars, target },
    highlights: [...discarded(), ...s.sortedHl(), ...highlights],
  });

  yield t.step("init", `The ${k}${k === 1 ? "st" : k === 2 ? "nd" : k === 3 ? "rd" : "th"} largest of ${n} values sits at index ${target} in sorted order. Search the whole array.`, snap([], [{ from: lo, to: hi, kind: "active", label: "[lo, hi]" }], hl("found", ai(target)), { lo, hi }));

  for (;;) {
    const pivot = s.a[hi];
    let i = lo;
    const zones = (j: number): Range[] => [
      ...(i > lo ? [{ from: lo, to: i - 1, kind: "window" as const, label: "< pivot" }] : []),
      ...(j > i ? [{ from: i, to: j - 1, kind: "active" as const, label: "≥ pivot" }] : []),
    ];
    const ptr = (j: number): Pointer[] => [{ name: "i", index: i }, ...(j < hi ? [{ name: "j", index: j }] : [])];
    yield t.step("partition", `Partition nums[${lo}..${hi}] around the last element, pivot = ${pivot}.`, snap(ptr(lo), [{ from: lo, to: hi, kind: "active", label: "[lo, hi]" }], hl("pivot", ai(hi)), { lo, hi, pivot }));
    for (let j = lo; j < hi; j++) {
      t.count("comparisons");
      if (s.a[j] < pivot) {
        yield t.step("compare", `nums[${j}] = ${s.a[j]} < ${pivot}: move it to the left zone.`, snap(ptr(j), zones(j), [...hl("pivot", ai(hi)), ...hl("compare", ai(j))], { lo, hi, pivot, i, j }));
        const same = i === j;
        s.swap(i, j);
        if (!same) t.count("swaps");
        i++;
        yield t.step("swap", same ? `Already at the boundary: i = ${i}.` : `Swap with nums[${i - 1}]; i = ${i}.`, snap(ptr(j + 1), zones(j + 1), [...hl("pivot", ai(hi)), ...(same ? [] : hl("swap", ai(i - 1), ai(j)))], { lo, hi, pivot, i, j }));
      } else {
        yield t.step("compare", `nums[${j}] = ${s.a[j]} ≥ ${pivot}: stays right.`, snap(ptr(j), zones(j + 1), [...hl("pivot", ai(hi)), ...hl("compare", ai(j))], { lo, hi, pivot, i, j }));
      }
    }
    s.swap(i, hi);
    if (i !== hi) t.count("swaps");
    s.done.add(i);
    yield t.step("place", `Pivot ${pivot} lands at index ${i} — its final sorted position.`, snap([{ name: "p", index: i }], zones(hi), hl("found", ai(i)), { lo, hi, pivot, p: i }));
    t.count("comparisons");
    if (i === target) {
      yield t.step("found", `The pivot landed exactly on the target index ${target}. The ${k}${k === 1 ? "st" : k === 2 ? "nd" : k === 3 ? "rd" : "th"} largest is ${s.a[i]}.`, snap([{ name: "p", index: i }], [], hl("found", ai(i)), { p: i, answer: s.a[i] }, s.a[i]));
      return;
    }
    yield t.step("check", `Pivot index ${i} ${i < target ? "<" : ">"} target ${target}: the answer is to the ${i < target ? "right" : "left"} of the pivot.`, snap([{ name: "p", index: i }], [], hl("current", ai(i)), { lo, hi, p: i }));
    if (i < target) {
      lo = i + 1;
      yield t.step("go-right", `Throw away everything up to index ${i} — keep only [${lo}..${hi}].`, snap([], [{ from: lo, to: hi, kind: "active", label: "[lo, hi]" }], [], { lo, hi }));
    } else {
      hi = i - 1;
      yield t.step("go-left", `Throw away everything from index ${i} on — keep only [${lo}..${hi}].`, snap([], [{ from: lo, to: hi, kind: "active", label: "[lo, hi]" }], [], { lo, hi }));
    }
  }
}

const sorted = range(14).map((x) => x + 1);

const algorithm: AlgorithmModule<Input, ArrayState> = {
  ...meta,
  renderer: "bars",
  inputSchema: {
    fields: [sortField({ maxLength: 20 }), { key: "k", label: "k", kind: "number", integer: true, min: 1, max: 20 }],
    validate: ({ nums, k }) => (k > nums.length ? `k must be at most the array length (${nums.length}).` : null),
  },
  presets: [
    { name: "LeetCode example", input: { nums: [3, 2, 1, 5, 6, 4], k: 2 } },
    { name: "With duplicates", input: { nums: [3, 2, 3, 1, 2, 4, 5, 5, 6], k: 4 } },
    { name: "Median of 11", input: { nums: [38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 71], k: 6 } },
    { name: "Worst case: sorted input, k = n", input: { nums: sorted, k: 14 } },
    { name: "Edge case: single element", input: { nums: [7], k: 1 } },
  ],
  randomInput: (size, rng = Math.random) => {
    const { nums } = randomSortInput(Math.min(size, 16), rng);
    return { nums, k: randInt(rng, 1, nums.length) };
  },
  code: { python, javascript },
  generate,
  reference: ({ nums, k }) => nums.slice().sort((a, b) => b - a)[k - 1],
  outputOf: (s) => s.result,
  info,
  legendLabels: { found: "Target index / placed pivot", pruned: "Discarded side", pivot: "Pivot", window: "< pivot zone", active: "Search range / ≥ pivot", compare: "Scanning", current: "Pivot position", sorted: "Pivot in final place" },
};

export default algorithm;
