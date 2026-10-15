import type { AlgorithmModule, Frame, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { ai, range, type ArrayRow, type ArrayState, type CellValue, type Pointer, type Range } from "../../_shared/array";
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
  let buffer: CellValue[] = Array(n).fill(null);

  const bufRow = (): ArrayRow => ({ label: "buffer", values: buffer.slice(), hideIndex: true });
  const snap = (pointers: Pointer[], ranges: Range[], highlights: Highlight[], vars: Record<string, unknown>) => ({
    state: s.state(pointers, ranges, [bufRow()]),
    vars,
    highlights,
    callStack: frames.map((f) => ({ ...f })),
  });

  function* sort(lo: number, hi: number): Generator<ReturnType<typeof t.step>, void> {
    frames.push({ call: `merge_sort(${lo}, ${hi})` });
    t.count("calls");
    const seg = [{ from: lo, to: hi, kind: "active" as const, label: `merge_sort(${lo}, ${hi})` }];
    yield t.step("call", `merge_sort(${lo}, ${hi}): sort nums[${lo}..${hi}] (${hi - lo + 1} element${hi === lo ? "" : "s"}).`, snap([], seg, [], { lo, hi }));
    if (lo >= hi) {
      yield t.step("base", `A single element is already sorted. Return.`, snap([], seg, hl("found", ai(lo)), { lo, hi }));
      frames.pop();
      return;
    }
    const mid = (lo + hi) >> 1;
    const halves: Range[] = [
      { from: lo, to: mid, kind: "window", label: "left" },
      { from: mid + 1, to: hi, kind: "active", label: "right" },
    ];
    yield t.step("split", `Split at mid = ${mid}: left half [${lo}..${mid}], right half [${mid + 1}..${hi}].`, snap([], halves, [], { lo, mid, hi }));
    yield t.step("left", `Recursively sort the left half [${lo}..${mid}].`, snap([], halves, [], { lo, mid, hi }));
    yield* sort(lo, mid);
    yield t.step("right", `Left half done. Now sort the right half [${mid + 1}..${hi}].`, snap([], halves, [], { lo, mid, hi }));
    yield* sort(mid + 1, hi);
    yield t.step("merge-call", `Both halves are sorted. Merge them.`, snap([], halves, [], { lo, mid, hi }));
    yield* merge(lo, mid, hi, halves);
    frames.pop();
  }

  function* merge(lo: number, mid: number, hi: number, halves: Range[]): Generator<ReturnType<typeof t.step>, void> {
    const buf: { v: number; id: number }[] = [];
    let i = lo;
    let j = mid + 1;
    buffer = Array(n).fill(null);
    const put = (k: number) => {
      buf.push({ v: s.a[k], id: s.ids[k] });
      buffer[lo + buf.length - 1] = s.a[k];
      t.count("writes");
    };
    const taken = () => hl("pruned", ...range(n).filter((k) => (k >= lo && k < i) || (k > mid && k < j)).map((k) => ai(k)));
    const ptrs = (): Pointer[] => [...(i <= mid ? [{ name: "i", index: i }] : []), ...(j <= hi ? [{ name: "j", index: j }] : [])];
    const bufHl = () => hl("sorted", ...range(buf.length).map((k) => ai(lo + k, 1)));

    yield t.step("merge-start", `merge(${lo}, ${mid}, ${hi}): i at the front of the left half, j at the front of the right half, empty buffer.`, snap(ptrs(), halves, [], { lo, mid, hi, i, j }));
    while (i <= mid && j <= hi) {
      t.count("comparisons");
      const leftWins = s.a[i] <= s.a[j];
      yield t.step("compare", `Compare nums[i] = ${s.a[i]} with nums[j] = ${s.a[j]}: ${leftWins ? (s.a[i] === s.a[j] ? "equal, so take the left one (keeps it stable)" : "left is smaller") : "right is smaller"}.`, snap(ptrs(), halves, [...taken(), ...bufHl(), ...hl("compare", ai(i), ai(j))], { lo, mid, hi, i, j, "len(buf)": buf.length }));
      if (leftWins) {
        put(i);
        i++;
        yield t.step("take-left", `Append ${buf[buf.length - 1].v} from the left half to the buffer.`, snap(ptrs(), halves, [...taken(), ...bufHl(), ...hl("current", ai(lo + buf.length - 1, 1))], { lo, mid, hi, i, j, "len(buf)": buf.length }));
      } else {
        put(j);
        j++;
        yield t.step("take-right", `Append ${buf[buf.length - 1].v} from the right half to the buffer.`, snap(ptrs(), halves, [...taken(), ...bufHl(), ...hl("current", ai(lo + buf.length - 1, 1))], { lo, mid, hi, i, j, "len(buf)": buf.length }));
      }
    }
    if (i <= mid || j <= hi) {
      const side = i <= mid ? "left" : "right";
      const rest = i <= mid ? s.a.slice(i, mid + 1) : s.a.slice(j, hi + 1);
      while (i <= mid) put(i++);
      while (j <= hi) put(j++);
      yield t.step("drain", `The other half is used up. Copy the ${side} half's leftovers [${rest.join(", ")}] — they are already in order.`, snap([], halves, [...taken(), ...bufHl()], { lo, mid, hi, "len(buf)": buf.length }));
    }
    for (let k = 0; k < buf.length; k++) {
      s.a[lo + k] = buf[k].v;
      s.ids[lo + k] = buf[k].id;
    }
    buffer = Array(n).fill(null);
    const whole = lo === 0 && hi === n - 1;
    if (whole) s.markAll();
    yield t.step("copy-back", `Write the buffer back over nums[${lo}..${hi}]: [${s.a.slice(lo, hi + 1).join(", ")}] is now sorted.`, snap([], [{ from: lo, to: hi, kind: "sorted", label: "merged" }], whole ? s.sortedHl() : hl("found", ...range(hi - lo + 1).map((k) => ai(lo + k))), { lo, mid, hi }));
  }

  yield* sort(0, n - 1);
  s.markAll();
  yield t.step("done", `All merges finished. Sorted: [${s.a.join(", ")}].`, {
    state: s.state([], [], [], s.a.slice()),
    highlights: s.sortedHl(),
    callStack: [],
  });
}

const algorithm: AlgorithmModule<SortInput, ArrayState> = {
  ...meta,
  renderer: "bars",
  inputSchema: { fields: [sortField({ maxLength: 16 })] },
  presets: sortPresets([{ name: "Power of two (8)", input: { nums: [5, 2, 4, 7, 1, 3, 2, 6] } }]),
  randomInput: (size, rng) => randomSortInput(Math.min(size, 12), rng),
  code: { python, javascript },
  generate,
  reference: sortedCopy,
  outputOf: (s) => s.result,
  info,
  legendLabels: { window: "Left half", active: "Right half / current call", compare: "Fronts being compared", pruned: "Already taken", current: "Just appended", sorted: "Merged / in buffer", found: "Sorted run" },
};

export default algorithm;
