import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { ai, type ArrayState } from "../../_shared/array";
import { Sortable, randomSortInput, sortField, sortPresets, sortedCopy, type SortInput } from "../../_shared/sorting";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

/**
 * The key is animated as it travels left: each shift is drawn as the key swapping places with
 * the larger neighbour, which is exactly where the gap is in the shift-based code.
 */
function* generate({ nums }: SortInput) {
  const t = new Tracer<ArrayState>();
  const s = new Sortable(nums);
  const n = nums.length;
  const prefix = (i: number) => (i > 0 ? [{ from: 0, to: i - 1, kind: "sorted" as const, label: "sorted prefix" }] : []);

  for (let i = 1; i < n; i++) {
    const key = s.a[i];
    let pos = i; // where the key currently sits (the gap)
    yield t.step("pass", `Take key = nums[${i}] = ${key} and insert it into the sorted prefix nums[0..${i - 1}].`, {
      state: s.state([{ name: "i", index: i }], prefix(i)),
      vars: { i, key, j: i - 1 },
      highlights: hl("current", ai(pos)),
    });
    while (pos > 0) {
      const j = pos - 1;
      t.count("comparisons");
      if (s.a[j] > key) {
        yield t.step("compare", `nums[${j}] = ${s.a[j]} > key ${key}: it must move right.`, {
          state: s.state([{ name: "i", index: i }, { name: "j", index: j }], prefix(i)),
          vars: { i, key, j },
          highlights: [...hl("compare", ai(j)), ...hl("current", ai(pos))],
        });
        s.swap(j, pos);
        t.count("writes");
        pos = j;
        yield t.step("shift", `Shift ${s.a[pos + 1]} right to index ${pos + 1}; the gap (and the key) moves to index ${pos}.`, {
          state: s.state([{ name: "i", index: i }, { name: "j", index: pos - 1 }], prefix(i)),
          vars: { i, key, j: pos - 1 },
          highlights: [...hl("swap", ai(pos + 1)), ...hl("current", ai(pos))],
        });
      } else {
        yield t.step("compare", `nums[${j}] = ${s.a[j]} ≤ key ${key}: stop here — everything further left is smaller or equal.`, {
          state: s.state([{ name: "i", index: i }, { name: "j", index: j }], prefix(i)),
          vars: { i, key, j },
          highlights: [...hl("compare", ai(j)), ...hl("current", ai(pos))],
        });
        break;
      }
    }
    t.count("writes");
    yield t.step(
      "place",
      pos === i ? `${key} stays at index ${i}; the prefix nums[0..${i}] is sorted.` : `Place key ${key} at index ${pos}. The prefix nums[0..${i}] is sorted.`,
      {
        state: s.state([{ name: "i", index: i }], prefix(i + 1)),
        vars: { i, key, "j + 1": pos },
        highlights: hl("found", ai(pos)),
      },
    );
  }

  s.markAll();
  yield t.step("done", `Every element has been inserted. Sorted: [${s.a.join(", ")}].`, {
    state: s.state([], [], [], s.a.slice()),
    highlights: s.sortedHl(),
  });
}

const algorithm: AlgorithmModule<SortInput, ArrayState> = {
  ...meta,
  renderer: "bars",
  inputSchema: { fields: [sortField({ maxLength: 16 })] },
  presets: sortPresets([{ name: "Nearly sorted (best showcase)", input: { nums: [2, 1, 3, 5, 4, 6, 7, 9, 8, 10] } }]),
  randomInput: (size, rng) => randomSortInput(Math.min(size, 12), rng),
  code: { python, javascript },
  generate,
  reference: sortedCopy,
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "Key", compare: "Compared with key", swap: "Shifted right", found: "Key placed", sorted: "Sorted" },
};

export default algorithm;
