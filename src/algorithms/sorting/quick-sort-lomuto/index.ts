import type { AlgorithmModule, Frame, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { ai, range, type ArrayState, type Pointer, type Range } from "../../_shared/array";
import { Sortable, randomSortInput, sortField, sortedCopy } from "../../_shared/sorting";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

type PivotRule = "last" | "middle" | "median3";

interface Input {
  nums: number[];
  pivot: PivotRule;
}

const RULE_TEXT: Record<PivotRule, string> = {
  last: "the last element",
  middle: "the middle element",
  median3: "the median of first, middle and last",
};

function choosePivot(a: number[], lo: number, hi: number, rule: PivotRule): number {
  if (rule === "last") return hi;
  const mid = (lo + hi) >> 1;
  if (rule === "middle") return mid;
  const cands = [lo, mid, hi].sort((x, y) => a[x] - a[y] || x - y);
  return cands[1];
}

function* generate({ nums, pivot: rule }: Input) {
  const t = new Tracer<ArrayState>();
  const s = new Sortable(nums);
  const n = nums.length;
  const frames: Frame[] = [];
  let depth = 0;
  let maxDepth = 0;

  const snap = (pointers: Pointer[], ranges: Range[], highlights: Highlight[], vars: Record<string, unknown>) => ({
    state: s.state(pointers, ranges),
    vars: { ...vars, depth, "max depth": maxDepth },
    highlights: [...s.sortedHl(), ...highlights],
    callStack: frames.map((f) => ({ ...f })),
  });

  function* sort(lo: number, hi: number): Generator<ReturnType<typeof t.step>, void> {
    frames.push({ call: `quick_sort(${lo}, ${hi})` });
    depth++;
    maxDepth = Math.max(maxDepth, depth);
    t.count("calls");
    const seg: Range[] = hi >= lo ? [{ from: lo, to: hi, kind: "active", label: `quick_sort(${lo}, ${hi})` }] : [];
    if (lo >= hi) {
      if (lo === hi) s.done.add(lo);
      yield t.step("base", lo === hi ? `quick_sort(${lo}, ${hi}): one element — already in place.` : `quick_sort(${lo}, ${hi}): empty range, nothing to do.`, snap([], seg, [], { lo, hi }));
      frames.pop();
      depth--;
      return;
    }
    yield t.step("call", `quick_sort(${lo}, ${hi}): sort nums[${lo}..${hi}] (${hi - lo + 1} elements).`, snap([], seg, [], { lo, hi }));
    yield t.step("partition-call", `Partition nums[${lo}..${hi}] around a pivot.`, snap([], seg, [], { lo, hi }));
    const p = yield* partition(lo, hi);
    const sides: Range[] = [
      ...(p - 1 >= lo ? [{ from: lo, to: p - 1, kind: "window" as const, label: "< pivot" }] : []),
      ...(hi >= p + 1 ? [{ from: p + 1, to: hi, kind: "active" as const, label: "≥ pivot" }] : []),
    ];
    const balance = `${p - lo} left, ${hi - p} right`;
    yield t.step("left", `Pivot is final at index ${p} (${balance}). Sort the left side [${lo}..${p - 1}].`, snap([], sides, [], { lo, hi, p }));
    yield* sort(lo, p - 1);
    yield t.step("right", `Now sort the right side [${p + 1}..${hi}].`, snap([], sides, [], { lo, hi, p }));
    yield* sort(p + 1, hi);
    frames.pop();
    depth--;
  }

  function* partition(lo: number, hi: number): Generator<ReturnType<typeof t.step>, number> {
    const k = choosePivot(s.a, lo, hi, rule);
    const seg: Range[] = [{ from: lo, to: hi, kind: "active", label: `partition(${lo}, ${hi})` }];
    yield t.step("choose", `Pivot rule: ${RULE_TEXT[rule]} → index ${k}, value ${s.a[k]}.`, snap([{ name: "pivot", index: k }], seg, hl("pivot", ai(k)), { lo, hi, k }));
    if (k !== hi) {
      s.swap(k, hi);
      t.count("swaps");
      yield t.step("pivot-to-end", `Swap the pivot to the end (index ${hi}) so the scan can treat it uniformly.`, snap([{ name: "pivot", index: hi }], seg, [...hl("swap", ai(k)), ...hl("pivot", ai(hi))], { lo, hi, k }));
    }
    const pivot = s.a[hi];
    let i = lo;
    const zones = (j: number): Range[] => [
      ...(i > lo ? [{ from: lo, to: i - 1, kind: "window" as const, label: "< pivot" }] : []),
      ...(j > i ? [{ from: i, to: j - 1, kind: "active" as const, label: "≥ pivot" }] : []),
    ];
    const ptr = (j: number): Pointer[] => [{ name: "i", index: i }, ...(j < hi ? [{ name: "j", index: j }] : []), { name: "pivot", index: hi }];
    yield t.step("init", `pivot = ${pivot}. i = ${lo} marks the end of the "< pivot" zone.`, snap(ptr(lo), zones(lo), hl("pivot", ai(hi)), { lo, hi, pivot, i }));
    for (let j = lo; j < hi; j++) {
      t.count("comparisons");
      if (s.a[j] < pivot) {
        yield t.step("compare", `nums[${j}] = ${s.a[j]} < ${pivot}: it belongs in the left zone.`, snap(ptr(j), zones(j), [...hl("pivot", ai(hi)), ...hl("compare", ai(j))], { lo, hi, pivot, i, j }));
        const same = i === j;
        s.swap(i, j);
        if (!same) t.count("swaps");
        i++;
        yield t.step("swap", same ? `It is already at the boundary; just grow the zone: i = ${i}.` : `Swap it with nums[${i - 1}] and grow the zone: i = ${i}.`, snap(ptr(j + 1), zones(j + 1), [...hl("pivot", ai(hi)), ...(same ? hl("current", ai(i - 1)) : hl("swap", ai(i - 1), ai(j)))], { lo, hi, pivot, i, j }));
      } else {
        yield t.step("compare", `nums[${j}] = ${s.a[j]} ≥ ${pivot}: leave it in the right zone.`, snap(ptr(j), zones(j + 1), [...hl("pivot", ai(hi)), ...hl("compare", ai(j))], { lo, hi, pivot, i, j }));
      }
    }
    s.swap(i, hi);
    if (i !== hi) t.count("swaps");
    s.done.add(i);
    yield t.step("place", `Swap the pivot into index ${i}: everything left of it is smaller, everything right is ≥ ${pivot}.`, snap([{ name: "p", index: i }], zones(hi), hl("found", ai(i)), { lo, hi, pivot, p: i }));
    return i;
  }

  yield* sort(0, n - 1);
  s.markAll();
  yield t.step("done", `Sorted: [${s.a.join(", ")}]. Deepest recursion: ${maxDepth} level${maxDepth === 1 ? "" : "s"} for n = ${n}.`, {
    state: s.state([], [], [], s.a.slice()),
    vars: { "max depth": maxDepth, n },
    highlights: s.sortedHl(),
    callStack: [],
  });
}

const sorted = range(14).map((k) => k + 1);

const algorithm: AlgorithmModule<Input, ArrayState> = {
  ...meta,
  renderer: "bars",
  inputSchema: {
    fields: [
      sortField({ maxLength: 20 }),
      {
        key: "pivot",
        label: "pivot rule",
        kind: "select",
        options: [
          { value: "last", label: "Last element" },
          { value: "middle", label: "Middle element" },
          { value: "median3", label: "Median of three" },
        ],
      },
    ],
  },
  presets: [
    { name: "Random 10 (last pivot)", input: { nums: [38, 27, 43, 3, 9, 82, 10, 55, 19, 64], pivot: "last" } },
    { name: "Worst case: sorted + last pivot", input: { nums: sorted, pivot: "last" } },
    { name: "Same sorted input + median of three", input: { nums: sorted, pivot: "median3" } },
    { name: "Duplicates (middle pivot)", input: { nums: [5, 1, 4, 5, 2, 1, 5, 3, 2], pivot: "middle" } },
    { name: "Edge case: single element", input: { nums: [7], pivot: "last" } },
  ],
  randomInput: (size, rng = Math.random) => ({
    ...randomSortInput(Math.min(size, 16), rng),
    pivot: (["last", "middle", "median3"] as const)[Math.floor(rng() * 3)],
  }),
  code: { python, javascript },
  generate,
  reference: ({ nums }) => sortedCopy({ nums }),
  outputOf: (s) => s.result,
  info,
  legendLabels: { pivot: "Pivot", window: "< pivot zone", active: "≥ pivot zone / current call", compare: "Scanning (j)", found: "Pivot placed", sorted: "Final position" },
};

export default algorithm;
