import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { ai, randomNumbers, type ArrayRow, type Pointer } from "../../_shared/array";
import { heapView, siftDownEvents, siftUpEvents, tn, type HeapItem, type TreeState } from "../../_shared/tree";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  arrays: number[][];
}

/** Heap entries carry (array i, position j); ids encode them so a value keeps its identity. */
interface Entry extends HeapItem {
  i: number;
  j: number;
}

const less = (a: HeapItem, b: HeapItem) => {
  const x = a as Entry;
  const y = b as Entry;
  return x.v < y.v || (x.v === y.v && x.i < y.i);
};

function* generate({ arrays }: Input) {
  const t = new Tracer<TreeState>();
  const k = arrays.length;
  const out: number[] = [];
  const front = arrays.map(() => 0); // index of the next value not yet popped, per array
  const entry = (i: number, j: number): Entry => ({ id: i * 100 + j, v: arrays[i][j], i, j, sub: `A${i}[${j}]` });
  const h: Entry[] = arrays.flatMap((a, i) => (a.length ? [entry(i, 0)] : []));
  for (let s = (h.length >> 1) - 1; s >= 0; s--) for (const ev of siftDownEvents(h, s, less)) if (ev.type === "compare") t.count("comparisons");

  const outRow = k; // the output row comes after the k input rows
  const snap = (extra: Highlight[] = [], result?: number[]) => {
    const rows: ArrayRow[] = arrays.map((a, i) => ({ label: `A${i}`, values: a.length ? a : [""] }));
    rows.push({ label: "out", values: out.length ? out.slice() : [""], hideIndex: true });
    const pointers: Pointer[] = arrays.flatMap((a, i) => (front[i] < a.length ? [{ name: "front", index: front[i], row: i }] : []));
    return {
      state: { trees: [heapView(h, `min-heap of fronts (${h.length} / ${k})`)], array: { rows, pointers }, result },
      vars: { "len(heap)": h.length, "len(out)": out.length },
      highlights: [
        ...arrays.flatMap((a, i) => a.slice(0, front[i]).map((_, j) => ({ id: ai(j, i), kind: "visited" as const }))),
        ...h.map((e) => ({ id: ai(e.j, e.i), kind: "frontier" as const })),
        ...extra,
      ],
    };
  };

  yield t.step(
    "init",
    h.length ? `Seed the heap with the first value of each non-empty array: ${h.map((e) => `${e.v} (A${e.i})`).join(", ")}. The root ${h[0].v} is the smallest of them.` : "Every array is empty — nothing to merge.",
    snap(h.length ? hl("found", tn(h[0].id)) : []),
  );

  while (true) {
    if (!h.length) {
      yield t.step("loop", "The heap is empty: every array is exhausted.", snap());
      break;
    }
    yield t.step("loop", `The heap still holds ${h.length} front${h.length === 1 ? "" : "s"}.`, snap());
    const top = h[0];
    yield t.step("pop", `Pop the root ${top.v}: it came from A${top.i}[${top.j}] and is the smallest front of all.`, snap([...hl("removed", tn(top.id)), ...hl("current", ai(top.j, top.i))]));
    const last = h.pop()!;
    t.count("pops");
    if (h.length) {
      h[0] = last;
      for (const ev of siftDownEvents(h, 0, less)) {
        if (ev.type === "compare") t.count("comparisons");
        if (ev.type === "swap") {
          t.count("swaps");
          yield t.step("pop", `Refill the root: ${h[ev.j].v} sinks below ${h[ev.i].v}.`, snap(hl("swap", tn(h[ev.i].id), tn(h[ev.j].id))));
        }
      }
    }
    out.push(top.v);
    front[top.i] = top.j + 1;
    t.count("writes");
    yield t.step("emit", `Append ${top.v} to the output: [${out.join(", ")}].`, snap(hl("found", ai(out.length - 1, outRow))));
    if (top.j + 1 < arrays[top.i].length) {
      const e = entry(top.i, top.j + 1);
      h.push(e);
      t.count("pushes");
      yield t.step("push", `A${top.i} has a next value, ${e.v}: push it as A${top.i}'s new front.`, snap([...hl("active", tn(e.id)), ...hl("current", ai(e.j, e.i))]));
      for (const ev of siftUpEvents(h, h.length - 1, less)) {
        if (ev.type === "compare") t.count("comparisons");
        if (ev.type === "swap") {
          t.count("swaps");
          yield t.step("push", `It rises above ${h[ev.i].v} (sift up).`, snap(hl("swap", tn(h[ev.j].id), tn(h[ev.i].id))));
        }
      }
    } else {
      yield t.step("push", `A${top.i} is used up — nothing to push.`, snap());
    }
  }
  yield t.step("done", `Merged ${out.length} values: [${out.join(", ")}].`, snap([], out.slice()));
}

const algorithm: AlgorithmModule<Input, TreeState> = {
  ...meta,
  renderer: "tree",
  inputSchema: {
    fields: [{ key: "arrays", label: "sorted arrays", kind: "matrix", maxRows: 4, maxCols: 6, min: -99, max: 99, rectangular: false, help: "One sorted array per line (JSON like [[1,4],[],[2]] also works)." }],
    validate: ({ arrays }) =>
      arrays.some((r) => r.some((x) => !Number.isInteger(x))) ? "Use whole numbers." : arrays.some((r) => r.some((x, j) => j > 0 && x < r[j - 1])) ? "Every array must be sorted ascending." : null,
  },
  presets: [
    { name: "Three arrays", input: { arrays: [[1, 4, 7], [2, 5, 8], [3, 6, 9]] } },
    { name: "Uneven lengths with ties", input: { arrays: [[1, 1, 5, 9], [1, 3], [2, 2, 2, 10, 11]] } },
    { name: "Edge case: one array", input: { arrays: [[3, 5, 8]] } },
    { name: "One long array, two short", input: { arrays: [[10, 20, 30, 40, 50, 60], [5], [35]] } },
  ],
  randomInput: (size, rng = Math.random) => ({
    arrays: Array.from({ length: randInt(rng, 1, 4) }, () => randomNumbers(rng, randInt(rng, 1, Math.min(6, Math.max(1, size))), 0, 20, 6).sort((a, b) => a - b)),
  }),
  code: { python, javascript },
  generate,
  reference: ({ arrays }) => arrays.flat().sort((a, b) => a - b),
  outputOf: (s) => s.result,
  info,
  legendLabels: { frontier: "Front (in the heap)", visited: "Already merged", removed: "Popped root", current: "Value being moved", found: "Output", active: "Pushed successor", swap: "Sift swap" },
};

export default algorithm;
