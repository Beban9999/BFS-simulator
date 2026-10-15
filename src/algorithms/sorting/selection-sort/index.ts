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

  for (let i = 0; i < n - 1; i++) {
    let minI = i;
    const ptr = (j?: number) => [{ name: "i", index: i }, { name: "min", index: minI }, ...(j !== undefined ? [{ name: "j", index: j }] : [])];
    const unsorted = [{ from: i, to: n - 1, kind: "active" as const, label: "unsorted" }];
    yield t.step("pass", `Pass ${i + 1}: find the minimum of nums[${i}..${n - 1}] and put it at index ${i}. Start with min = nums[${i}] = ${s.a[i]}.`, {
      state: s.state(ptr(), unsorted),
      vars: { i, min_i: minI, "nums[min_i]": s.a[minI] },
      highlights: [...s.sortedHl(), ...hl("current", ai(minI))],
    });
    for (let j = i + 1; j < n; j++) {
      t.count("comparisons");
      if (s.a[j] < s.a[minI]) {
        yield t.step("compare", `nums[${j}] = ${s.a[j]} < current min ${s.a[minI]}.`, {
          state: s.state(ptr(j), unsorted),
          vars: { i, j, min_i: minI, "nums[min_i]": s.a[minI] },
          highlights: [...s.sortedHl(), ...hl("current", ai(minI)), ...hl("compare", ai(j))],
        });
        minI = j;
        yield t.step("new-min", `New minimum: min_i = ${j} (value ${s.a[j]}).`, {
          state: s.state(ptr(j), unsorted),
          vars: { i, j, min_i: minI, "nums[min_i]": s.a[minI] },
          highlights: [...s.sortedHl(), ...hl("current", ai(minI))],
        });
      } else {
        yield t.step("compare", `nums[${j}] = ${s.a[j]} ≥ current min ${s.a[minI]}: keep the minimum.`, {
          state: s.state(ptr(j), unsorted),
          vars: { i, j, min_i: minI, "nums[min_i]": s.a[minI] },
          highlights: [...s.sortedHl(), ...hl("current", ai(minI)), ...hl("compare", ai(j))],
        });
      }
    }
    const moved = minI !== i;
    if (moved) {
      s.swap(i, minI);
      t.count("swaps");
    }
    s.done.add(i);
    yield t.step(
      "swap",
      moved
        ? `Swap the minimum ${s.a[i]} into index ${i} (and ${s.a[minI]} goes to index ${minI}). Index ${i} is final.`
        : `The minimum ${s.a[i]} is already at index ${i}; no swap needed. Index ${i} is final.`,
      {
        state: s.state([{ name: "i", index: i }, { name: "min", index: minI }]),
        vars: { i, min_i: minI },
        highlights: [...s.sortedHl(), ...(moved ? hl("swap", ai(i), ai(minI)) : [])],
      },
    );
  }

  s.markAll();
  yield t.step("done", `The last element is the largest by elimination. Sorted: [${s.a.join(", ")}].`, {
    state: s.state([], [], [], s.a.slice()),
    highlights: s.sortedHl(),
  });
}

const algorithm: AlgorithmModule<SortInput, ArrayState> = {
  ...meta,
  renderer: "bars",
  inputSchema: { fields: [sortField({ maxLength: 16 })] },
  presets: sortPresets([{ name: "Unstable: equal values swap order", input: { nums: [4, 4, 2, 1] } }]),
  randomInput: (size, rng) => randomSortInput(Math.min(size, 12), rng),
  code: { python, javascript },
  generate,
  reference: sortedCopy,
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "Current minimum", compare: "Scanning", sorted: "Final position", active: "Unsorted part" },
};

export default algorithm;
