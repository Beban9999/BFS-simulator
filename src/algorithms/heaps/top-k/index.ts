import type { AlgorithmModule, Highlight, HighlightKind } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { ai, numbersField, randomNumbers } from "../../_shared/array";
import { heapView, minFirst, siftDownEvents, siftUpEvents, tn, type HeapItem, type TreeState } from "../../_shared/tree";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  nums: number[];
  k: number;
}

const ord = (k: number) => `${k}${k % 10 === 1 && k !== 11 ? "st" : k % 10 === 2 && k !== 12 ? "nd" : k % 10 === 3 && k !== 13 ? "rd" : "th"}`;

function* generate({ nums, k }: Input) {
  const t = new Tracer<TreeState>();
  const h: HeapItem[] = [];
  const skipped: number[] = [];
  const kept = new Set<number>(); // indexes of nums currently in the heap
  const where = new Map<number, number>(); // heap item id -> index in nums

  const onHeap = (kind: HighlightKind, ...idx: number[]): Highlight[] => idx.filter((i) => i >= 0 && i < h.length).map((i) => ({ id: tn(h[i].id), kind }));
  const snap = (x: number | null, extra: Highlight[] = [], result?: number) => ({
    state: {
      trees: [heapView(h, `min-heap (size ${h.length} / k = ${k})`, { note: h.length ? `root = ${h[0].v} = the weakest of the top ${h.length}` : "empty" })],
      array: {
        rows: [{ label: "nums", values: nums }],
        pointers: x === null ? [] : [{ name: "x", index: x }],
      },
      result,
    },
    vars: { x: x === null ? "—" : nums[x], "len(heap)": h.length, "heap[0]": h.length ? h[0].v : "—" },
    highlights: [...hl("found", ...[...kept].map((i) => ai(i))), ...hl("pruned", ...skipped.map((i) => ai(i))), ...extra],
  });

  yield t.step("init", `Find the ${ord(k)} largest of ${nums.length} values with a min-heap that never holds more than ${k}.`, snap(null));

  for (let i = 0; i < nums.length; i++) {
    const x = nums[i];
    yield t.step("loop", `x = ${x}.`, snap(i, hl("current", ai(i))));
    if (h.length < k) {
      const it = { id: i, v: x };
      h.push(it);
      kept.add(i);
      where.set(it.id, i);
      t.count("pushes");
      yield t.step("push", `The heap has only ${h.length - 1} of ${k} values: push ${x}.`, snap(i, [...hl("current", ai(i)), ...onHeap("active", h.length - 1)]));
      for (const ev of siftUpEvents(h, h.length - 1, minFirst)) {
        if (ev.type === "compare") t.count("comparisons");
        if (ev.type === "swap") {
          t.count("swaps");
          yield t.step("push", `heappush sifts ${h[ev.j].v} up past ${h[ev.i].v}.`, snap(i, [...hl("current", ai(i)), ...onHeap("swap", ev.i, ev.j)]));
        }
      }
      continue;
    }
    t.count("comparisons");
    const root = h[0];
    if (x <= root.v) {
      skipped.push(i);
      yield t.step("compare", `${x} ≤ root ${root.v}: it can't be in the top ${k}. Skip it.`, snap(i, [...hl("mismatch", ai(i)), ...onHeap("compare", 0)]));
      continue;
    }
    yield t.step("compare", `${x} > root ${root.v}: ${x} beats the weakest of the top ${k}.`, snap(i, [...hl("current", ai(i)), ...onHeap("compare", 0)]));
    const out = where.get(root.id)!;
    kept.delete(out);
    skipped.push(out);
    const it = { id: i, v: x };
    h[0] = it;
    kept.add(i);
    where.set(it.id, i);
    t.count("writes");
    yield t.step("replace", `heapreplace: ${root.v} leaves, ${x} takes the root — then sinks to its place.`, snap(i, [...hl("current", ai(i)), ...hl("removed", ai(out)), ...onHeap("active", 0)]));
    for (const ev of siftDownEvents(h, 0, minFirst)) {
      if (ev.type === "compare") t.count("comparisons");
      if (ev.type === "swap") {
        t.count("swaps");
        yield t.step("replace", `Sift down: ${h[ev.j].v} swaps below ${h[ev.i].v}.`, snap(i, [...hl("current", ai(i)), ...onHeap("swap", ev.i, ev.j)]));
      }
    }
  }

  yield t.step(
    "done",
    k === 1 ? `The heap holds only the largest value, ${h[0].v} — the answer.` : `The heap holds the ${k} largest values {${h.map((it) => it.v).sort((a, b) => b - a).join(", ")}}; its root ${h[0].v} is the ${ord(k)} largest.`,
    snap(null, onHeap("found", 0), h[0].v),
  );
}

const algorithm: AlgorithmModule<Input, TreeState> = {
  ...meta,
  renderer: "tree",
  inputSchema: {
    fields: [numbersField("nums", "nums", { minLength: 1, maxLength: 14 }), { key: "k", label: "k", kind: "number", integer: true, min: 1, max: 14 }],
    validate: ({ nums, k }) => (k > nums.length ? "k must be at most the number of values." : null),
  },
  presets: [
    { name: "LeetCode example: k = 2", input: { nums: [3, 2, 1, 5, 6, 4], k: 2 } },
    { name: "Duplicates: k = 4", input: { nums: [3, 2, 3, 1, 2, 4, 5, 5, 6], k: 4 } },
    { name: "Edge case: k = 1 (the maximum)", input: { nums: [7, 1, 9, 4], k: 1 } },
    { name: "Worst case: increasing (every value replaces the root)", input: { nums: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], k: 3 } },
    { name: "k = n (the minimum)", input: { nums: [5, 8, 2, 6], k: 4 } },
  ],
  randomInput: (size, rng = Math.random) => {
    const nums = randomNumbers(rng, size, 0, 20, 14);
    return { nums, k: randInt(rng, 1, Math.min(7, nums.length)) };
  },
  code: { python, javascript },
  generate,
  reference: ({ nums, k }) => nums.slice().sort((a, b) => b - a)[k - 1],
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "x", found: "In the top k", pruned: "Out (skipped or replaced)", mismatch: "Too small: skip", compare: "Root (weakest kept)", active: "Just placed", swap: "Sift swap", removed: "Kicked out" },
};

export default algorithm;
