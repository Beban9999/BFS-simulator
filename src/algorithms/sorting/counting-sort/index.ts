import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { ai, range, type ArrayState, type CellValue } from "../../_shared/array";
import { sortField, sortedCopy, type SortInput } from "../../_shared/sorting";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

const MAX_VALUE = 15;

function* generate({ nums }: SortInput) {
  const t = new Tracer<ArrayState>();
  const n = nums.length;
  const k = Math.max(...nums) + 1;
  const count = Array(k).fill(0);
  const out: CellValue[] = Array(n).fill(null);
  const state = (result?: number[]): ArrayState => ({
    rows: [
      { label: "nums", values: nums },
      { label: "count[v]", values: count.slice() },
      { label: "out", values: out.slice() },
    ],
    caption: `values 0..${k - 1} → count has k = ${k} slots (its index is the value v)`,
    result,
  });

  yield t.step("init", `The largest value is ${k - 1}, so make a count array with ${k} zeros.`, { state: state(), vars: { k, n } });

  for (let i = 0; i < n; i++) {
    const x = nums[i];
    count[x]++;
    t.count("writes");
    yield t.step("count", `nums[${i}] = ${x}: count[${x}] becomes ${count[x]}.`, {
      state: state(),
      vars: { x, [`count[${x}]`]: count[x] },
      highlights: [...hl("visited", ...range(i).map((j) => ai(j, 0))), ...hl("current", ai(i, 0), ai(x, 1))],
    });
  }

  for (let v = 1; v < k; v++) {
    count[v] += count[v - 1];
    yield t.step("prefix", `count[${v}] += count[${v - 1}] → ${count[v]}: ${count[v]} value${count[v] === 1 ? " is" : "s are"} ≤ ${v}.`, {
      state: state(),
      vars: { v, [`count[${v}]`]: count[v] },
      highlights: [...hl("compare", ai(v - 1, 1)), ...hl("current", ai(v, 1))],
    });
  }

  for (let i = n - 1; i >= 0; i--) {
    const x = nums[i];
    count[x]--;
    out[count[x]] = x;
    t.count("writes");
    yield t.step("place", `nums[${i}] = ${x}: decrement count[${x}] to ${count[x]} and write ${x} at out[${count[x]}].`, {
      state: state(),
      vars: { i, x, [`count[${x}]`]: count[x] },
      highlights: [
        ...hl("visited", ...range(n - 1 - i).map((j) => ai(n - 1 - j, 0))),
        ...hl("sorted", ...range(n).filter((j) => out[j] !== null).map((j) => ai(j, 2))),
        ...hl("current", ai(i, 0), ai(x, 1)),
        ...hl("found", ai(count[x], 2)),
      ],
    });
  }

  yield t.step("done", `out = [${out.join(", ")}] — sorted without a single comparison between elements.`, {
    state: state(out.slice() as number[]),
    vars: { out },
    highlights: hl("sorted", ...range(n).map((j) => ai(j, 2))),
  });
}

const algorithm: AlgorithmModule<SortInput, ArrayState> = {
  ...meta,
  renderer: "array",
  inputSchema: { fields: [sortField({ max: MAX_VALUE, maxLength: 14 })] },
  presets: [
    { name: "Small values with repeats", input: { nums: [4, 2, 2, 8, 3, 3, 1] } },
    { name: "Grades 0..5", input: { nums: [3, 5, 0, 2, 5, 1, 3, 3, 4, 0] } },
    { name: "Edge case: all equal", input: { nums: [6, 6, 6, 6] } },
    { name: "Worst case for space: one big value", input: { nums: [1, 0, 15, 2] } },
  ],
  randomInput: (size, rng = Math.random) => ({ nums: Array.from({ length: Math.max(1, Math.min(14, size + 2)) }, () => randInt(rng, 0, 9)) }),
  code: { python, javascript },
  generate,
  reference: sortedCopy,
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "Current value / its counter", visited: "Processed", compare: "Previous running total", found: "Just written", sorted: "Filled output" },
};

export default algorithm;
