import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { ai, type ArrayState } from "../../_shared/array";
import { Sortable, randomSortInput, sortField, sortPresets, sortedCopy, type SortInput } from "../../_shared/sorting";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

function* generate({ nums }: SortInput) {
  const t = new Tracer<ArrayState>();
  const s = new Sortable(nums);
  const n = nums.length;

  for (let end = n - 1; end > 0; end--) {
    let swapped = false;
    yield t.step("pass", `Pass with end = ${end}: bubble the largest of nums[0..${end}] to index ${end}.`, {
      state: s.state([{ name: "end", index: end }], [{ from: 0, to: end, kind: "active", label: "unsorted" }]),
      vars: { end },
      highlights: s.sortedHl(),
    });
    for (let i = 0; i < end; i++) {
      t.count("comparisons");
      const ptr = [{ name: "i", index: i }, { name: "end", index: end }];
      if (s.a[i] > s.a[i + 1]) {
        yield t.step("compare", `${s.a[i]} > ${s.a[i + 1]}: out of order.`, { state: s.state(ptr), vars: { end, i, swapped }, highlights: [...s.sortedHl(), ...hl("compare", ai(i), ai(i + 1))] });
        s.swap(i, i + 1);
        swapped = true;
        t.count("swaps");
        yield t.step("swap", `Swap them.`, { state: s.state(ptr), vars: { end, i, swapped }, highlights: [...s.sortedHl(), ...hl("swap", ai(i), ai(i + 1))] });
      } else {
        yield t.step("compare", `${s.a[i]} ≤ ${s.a[i + 1]}: in order, no swap.`, { state: s.state(ptr), vars: { end, i, swapped }, highlights: [...s.sortedHl(), ...hl("compare", ai(i), ai(i + 1))] });
      }
    }
    s.done.add(end);
    if (!swapped) {
      s.markAll();
      yield t.step("early-exit", "This pass made no swaps, so the rest is already sorted. Stop early.", { state: s.state(), vars: { end, swapped }, highlights: s.sortedHl() });
      break;
    }
  }
  s.markAll();
  yield t.step("done", `Sorted: [${s.a.join(", ")}].`, { state: s.state([], [], [], s.a.slice()), highlights: s.sortedHl() });
}

const algorithm: AlgorithmModule<SortInput, ArrayState> = {
  ...meta,
  renderer: "bars",
  inputSchema: { fields: [sortField({ maxLength: 16 })] },
  presets: sortPresets([{ name: "Nearly sorted", input: { nums: [1, 2, 4, 3, 5, 6, 8, 7] } }]),
  randomInput: (size, rng) => randomSortInput(Math.min(size, 12), rng),
  code: { python, javascript },
  generate,
  reference: sortedCopy,
  outputOf: (s) => s.result,
  info,
  legendLabels: { sorted: "In final position" },
};

export default algorithm;
