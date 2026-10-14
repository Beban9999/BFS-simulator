import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { ai, numbersField, randomNumbers, type ArrayState, type CellValue, type Range } from "../../_shared/array";
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
  const count = new Map<number, number>([[0, 1]]);
  /** prefix totals seen so far, prefixes[j] = sum of first j items */
  const prefixes: number[] = [0];
  const prefixRow: CellValue[] = [0, ...Array(nums.length).fill(null)];
  let total = 0;
  let answer = 0;
  const aux = (hot?: number) => {
    const items = [...count.entries()];
    return [{ label: "count (prefix total → times seen)", kind: "map" as const, items, highlight: hot === undefined ? undefined : [items.findIndex(([v]) => v === hot)] }];
  };
  const state = (i: number, ranges: Range[] = [], result?: number): ArrayState => ({
    rows: [
      { label: "nums", values: nums },
      { label: "prefix", values: prefixRow.slice() },
    ],
    pointers: i >= 0 && i < nums.length ? [{ name: "i", index: i, row: 0 }] : [],
    ranges,
    caption: `k = ${k}`,
    result,
  });

  yield t.step("init", "Seed the map with {0: 1}: the empty prefix, so subarrays starting at index 0 can be counted.", {
    state: state(-1),
    vars: { total, answer },
    aux: aux(0),
    highlights: hl("current", ai(0, 1)),
  });

  for (let i = 0; i < nums.length; i++) {
    total += nums[i];
    prefixRow[i + 1] = total;
    yield t.step("add", `total += nums[${i}] → ${total}.`, {
      state: state(i),
      vars: { i, x: nums[i], total, "total − k": total - k, answer },
      aux: aux(),
      highlights: hl("current", ai(i, 0), ai(i + 1, 1)),
    });

    const need = total - k;
    const hits = count.get(need) ?? 0;
    t.count("hashes");
    answer += hits;
    const starts = prefixes.map((v, j) => (v === need ? j : -1)).filter((j) => j >= 0);
    const ranges: Range[] = starts.map((j) => ({ from: j, to: i, kind: "found", label: `sum ${k}`, row: 0 }));
    yield t.step(
      "lookup",
      hits
        ? `total − k = ${need} was seen ${hits} time${hits === 1 ? "" : "s"}, so ${hits} subarray${hits === 1 ? " ends" : "s end"} here with sum ${k}. answer = ${answer}.`
        : `total − k = ${need} has not been seen, so no subarray ending at ${i} sums to ${k}.`,
      {
        state: state(i, ranges),
        vars: { i, total, "total − k": need, [`count[${need}]`]: hits, answer },
        aux: aux(hits ? need : undefined),
        highlights: [...hl("current", ai(i + 1, 1)), ...hl("compare", ...starts.map((j) => ai(j, 1)))],
      },
    );

    count.set(total, (count.get(total) ?? 0) + 1);
    prefixes.push(total);
    yield t.step("store", `Record this prefix: count[${total}] = ${count.get(total)}.`, {
      state: state(i),
      vars: { i, total, answer },
      aux: aux(total),
      highlights: hl("current", ai(i + 1, 1)),
    });
  }

  yield t.step("done", `Scanned every index: ${answer} subarray${answer === 1 ? "" : "s"} sum to ${k}.`, {
    state: state(-1, [], answer),
    vars: { answer },
    aux: aux(),
  });
}

function reference({ nums, k }: Input): number {
  let c = 0;
  for (let i = 0; i < nums.length; i++) {
    let s = 0;
    for (let j = i; j < nums.length; j++) {
      s += nums[j];
      if (s === k) c++;
    }
  }
  return c;
}

const algorithm: AlgorithmModule<Input, ArrayState> = {
  ...meta,
  renderer: "array",
  inputSchema: {
    fields: [numbersField("nums", "nums", { minLength: 1, maxLength: 14 }), { key: "k", label: "k", kind: "number", integer: true, min: -100, max: 100 }],
  },
  presets: [
    { name: "LeetCode example", input: { nums: [1, 2, 3], k: 3 } },
    { name: "With negatives", input: { nums: [3, 4, 7, 2, -3, 1, 4, 2], k: 7 } },
    { name: "Edge case: all zeros, k = 0", input: { nums: [0, 0, 0], k: 0 } },
    { name: "Worst case for windows: mixed signs", input: { nums: [1, -1, 1, -1, 1, -1], k: 0 } },
  ],
  randomInput: (size, rng = Math.random) => ({ nums: randomNumbers(rng, size, -3, 5, 14), k: randInt(rng, -2, 8) }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (s) => s.result,
  info,
  legendLabels: { compare: "Matching earlier prefix", current: "Current prefix" },
  legendExtra: ["found"],
};

export default algorithm;
