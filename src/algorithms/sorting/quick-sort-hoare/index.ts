import type { AlgorithmModule, Frame, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { ai, range, type ArrayState, type Pointer, type Range } from "../../_shared/array";
import { Sortable, randomSortInput, sortField, sortPresets, sortedCopy, type SortInput } from "../../_shared/sorting";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

function* generate({ nums }: SortInput) {
  const t = new Tracer<ArrayState>();
  const s = new Sortable(nums);
  const n = nums.length;
  const frames: Frame[] = [];

  const snap = (pointers: Pointer[], ranges: Range[], highlights: Highlight[], vars: Record<string, unknown>) => ({
    state: s.state(pointers, ranges),
    vars,
    highlights: [...s.sortedHl(), ...highlights],
    callStack: frames.map((f) => ({ ...f })),
  });

  function* sort(lo: number, hi: number): Generator<ReturnType<typeof t.step>, void> {
    frames.push({ call: `quick_sort(${lo}, ${hi})` });
    t.count("calls");
    const seg: Range[] = [{ from: lo, to: hi, kind: "active", label: `quick_sort(${lo}, ${hi})` }];
    if (lo >= hi) {
      s.done.add(lo);
      yield t.step("base", `quick_sort(${lo}, ${hi}): one element — it is in its final place.`, snap([], seg, [], { lo, hi }));
      frames.pop();
      return;
    }
    yield t.step("call", `quick_sort(${lo}, ${hi}): sort nums[${lo}..${hi}].`, snap([], seg, [], { lo, hi }));
    yield t.step("partition-call", `Partition nums[${lo}..${hi}].`, snap([], seg, [], { lo, hi }));
    const p = yield* partition(lo, hi);
    const sides: Range[] = [
      { from: lo, to: p, kind: "window", label: "≤ pivot" },
      { from: p + 1, to: hi, kind: "active", label: "≥ pivot" },
    ];
    yield t.step("left", `Split point p = ${p}. Sort the left part [${lo}..${p}] — p included, because the pivot isn't necessarily at p.`, snap([], sides, [], { lo, hi, p }));
    yield* sort(lo, p);
    yield t.step("right", `Now sort the right part [${p + 1}..${hi}].`, snap([], sides, [], { lo, hi, p }));
    yield* sort(p + 1, hi);
    frames.pop();
  }

  function* partition(lo: number, hi: number): Generator<ReturnType<typeof t.step>, number> {
    const mid = (lo + hi) >> 1;
    const pivot = s.a[mid];
    let i = lo - 1;
    let j = hi + 1;
    const seg: Range[] = [{ from: lo, to: hi, kind: "active", label: `partition(${lo}, ${hi})` }];
    const ptr = (): Pointer[] => [{ name: "i", index: i }, { name: "j", index: j }];
    const sidesHl = () => [
      ...hl("window", ...range(Math.max(0, i - lo)).map((k) => ai(lo + k))),
      ...hl("visited", ...range(Math.max(0, hi - j)).map((k) => ai(j + 1 + k))),
    ];
    yield t.step("init", `pivot = nums[${mid}] = ${pivot} (middle element). i starts just left of the range, j just right of it.`, snap(ptr(), seg, hl("pivot", ai(mid)), { lo, hi, pivot, i, j }));
    for (;;) {
      i++;
      t.count("comparisons");
      while (s.a[i] < pivot) {
        yield t.step("move-i", `nums[${i}] = ${s.a[i]} < ${pivot}: already on the correct (left) side; i moves right.`, snap(ptr(), seg, [...sidesHl(), ...hl("compare", ai(i))], { pivot, i, j }));
        i++;
        t.count("comparisons");
      }
      yield t.step("move-i", `nums[${i}] = ${s.a[i]} ≥ ${pivot}: i stops here.`, snap(ptr(), seg, [...sidesHl(), ...hl("current", ai(i))], { pivot, i, j }));
      j--;
      t.count("comparisons");
      while (s.a[j] > pivot) {
        yield t.step("move-j", `nums[${j}] = ${s.a[j]} > ${pivot}: already on the correct (right) side; j moves left.`, snap(ptr(), seg, [...sidesHl(), ...hl("current", ai(i)), ...hl("compare", ai(j))], { pivot, i, j }));
        j--;
        t.count("comparisons");
      }
      yield t.step("move-j", `nums[${j}] = ${s.a[j]} ≤ ${pivot}: j stops here.`, snap(ptr(), seg, [...sidesHl(), ...hl("current", ai(i), ai(j))], { pivot, i, j }));
      if (i >= j) {
        yield t.step("cross", `i = ${i} ≥ j = ${j}: the pointers met or crossed. nums[${lo}..${j}] ≤ ${pivot} ≤ nums[${j + 1}..${hi}]. Return ${j}.`, snap(ptr(), [{ from: lo, to: j, kind: "window", label: "≤ pivot" }, { from: j + 1, to: hi, kind: "active", label: "≥ pivot" }], [], { pivot, i, j }));
        return j;
      }
      s.swap(i, j);
      t.count("swaps");
      yield t.step("swap", `Both are on the wrong side: swap ${s.a[j]} and ${s.a[i]} → nums[${i}] = ${s.a[i]}, nums[${j}] = ${s.a[j]}.`, snap(ptr(), seg, [...sidesHl(), ...hl("swap", ai(i), ai(j))], { pivot, i, j }));
    }
  }

  yield* sort(0, n - 1);
  s.markAll();
  yield t.step("done", `Sorted: [${s.a.join(", ")}].`, { state: s.state([], [], [], s.a.slice()), highlights: s.sortedHl(), callStack: [] });
}

const algorithm: AlgorithmModule<SortInput, ArrayState> = {
  ...meta,
  renderer: "bars",
  inputSchema: { fields: [sortField({ maxLength: 20 })] },
  presets: sortPresets([{ name: "Many equal values", input: { nums: [4, 4, 4, 1, 4, 4, 9, 4, 4, 4] } }]),
  randomInput: (size, rng) => randomSortInput(Math.min(size, 16), rng),
  code: { python, javascript },
  generate,
  reference: sortedCopy,
  outputOf: (s) => s.result,
  info,
  legendLabels: { pivot: "Pivot value", window: "Left part (≤ pivot)", visited: "Right part (≥ pivot)", active: "Current range / right part", compare: "Scanning", current: "Pointer stopped", swap: "Swapped", sorted: "Final" },
};

export default algorithm;
