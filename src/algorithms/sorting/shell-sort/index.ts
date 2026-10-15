import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { ai, range, type ArrayState } from "../../_shared/array";
import { Sortable, randomSortInput, sortField, sortPresets, sortedCopy, type SortInput } from "../../_shared/sorting";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

function* generate({ nums }: SortInput) {
  const t = new Tracer<ArrayState>();
  const s = new Sortable(nums);
  const n = nums.length;
  /** Elements of the sub-sequence (same residue mod gap) that index i belongs to. */
  const chain = (i: number, gap: number): Highlight[] => hl("active", ...range(n).filter((k) => k % gap === i % gap).map((k) => ai(k)));

  for (let gap = n >> 1; gap > 0; gap >>= 1) {
    yield t.step("gap", gap === 1 ? "gap = 1: a plain insertion sort, but on an array that is now nearly sorted." : `gap = ${gap}: insertion-sort each sub-sequence of elements ${gap} apart.`, {
      state: s.state([], [], [], undefined),
      vars: { gap },
    });
    for (let i = gap; i < n; i++) {
      const key = s.a[i];
      let pos = i;
      yield t.step("pass", `i = ${i}: key = ${key}. Compare it with the elements ${gap} step${gap === 1 ? "" : "s"} to its left.`, {
        state: s.state([{ name: "i", index: i }]),
        vars: { gap, i, key, j: pos },
        highlights: [...chain(i, gap), ...hl("current", ai(pos))],
      });
      while (pos >= gap) {
        t.count("comparisons");
        const left = pos - gap;
        if (s.a[left] > key) {
          yield t.step("compare", `nums[${left}] = ${s.a[left]} > key ${key}: shift it ${gap} to the right.`, {
            state: s.state([{ name: "i", index: i }, { name: "j", index: pos }]),
            vars: { gap, i, key, j: pos },
            highlights: [...chain(i, gap), ...hl("compare", ai(left)), ...hl("current", ai(pos))],
          });
          s.swap(left, pos);
          t.count("writes");
          pos = left;
          yield t.step("shift", `The key's gap moves to index ${pos}.`, {
            state: s.state([{ name: "i", index: i }, { name: "j", index: pos }]),
            vars: { gap, i, key, j: pos },
            highlights: [...chain(i, gap), ...hl("swap", ai(pos + gap)), ...hl("current", ai(pos))],
          });
        } else {
          yield t.step("compare", `nums[${left}] = ${s.a[left]} ≤ key ${key}: stop.`, {
            state: s.state([{ name: "i", index: i }, { name: "j", index: pos }]),
            vars: { gap, i, key, j: pos },
            highlights: [...chain(i, gap), ...hl("compare", ai(left)), ...hl("current", ai(pos))],
          });
          break;
        }
      }
      t.count("writes");
      yield t.step("place", pos === i ? `${key} stays at index ${i}.` : `Place key ${key} at index ${pos}${i - pos > gap ? ` — it jumped ${i - pos} positions in ${(i - pos) / gap} hops` : ""}.`, {
        state: s.state([{ name: "i", index: i }]),
        vars: { gap, i, key, j: pos },
        highlights: [...chain(i, gap), ...hl("found", ai(pos))],
      });
    }
  }

  s.markAll();
  yield t.step("done", `Sorted: [${s.a.join(", ")}].`, { state: s.state([], [], [], s.a.slice()), highlights: s.sortedHl() });
}

const algorithm: AlgorithmModule<SortInput, ArrayState> = {
  ...meta,
  renderer: "bars",
  inputSchema: { fields: [sortField({ maxLength: 16 })] },
  presets: sortPresets([{ name: "Small values at the far end", input: { nums: [9, 10, 11, 12, 13, 14, 1, 2, 3, 4] } }]),
  randomInput: (size, rng) => randomSortInput(Math.min(size, 12), rng),
  code: { python, javascript },
  generate,
  reference: sortedCopy,
  outputOf: (s) => s.result,
  info,
  legendLabels: { active: "Current gap sub-sequence", current: "Key", compare: "Compared", swap: "Shifted", found: "Key placed" },
};

export default algorithm;
