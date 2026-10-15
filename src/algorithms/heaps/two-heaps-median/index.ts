import type { AlgorithmModule, Highlight, Step } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { ai, numbersField, randomNumbers } from "../../_shared/array";
import { heapView, maxFirst, minFirst, siftDownEvents, siftUpEvents, tn, type HeapItem, type TreeState } from "../../_shared/tree";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  nums: number[];
}

type Less = (a: HeapItem, b: HeapItem) => boolean;

function* generate({ nums }: Input) {
  const t = new Tracer<TreeState>();
  const low: HeapItem[] = [];
  const high: HeapItem[] = [];
  const medians: number[] = [];
  let at: number | null = null;
  let nextId = 0;

  const snap = (line: string, message: string, extra: Highlight[] = [], result?: number[]): Step<TreeState> =>
    t.step(line, message, {
      state: {
        trees: [
          heapView(low, "low: max-heap (smaller half)", { note: low.length ? `max = ${low[0].v} · size ${low.length}` : "empty", showIndex: false }),
          heapView(high, "high: min-heap (larger half)", { note: high.length ? `min = ${high[0].v} · size ${high.length}` : "empty", showIndex: false }),
        ],
        array: {
          rows: [
            { label: "stream", values: nums },
            { label: "median", values: medians.length ? medians : [""], hideIndex: true },
          ],
          pointers: at === null ? [] : [{ name: "x", index: at }],
        },
        result,
      },
      vars: { x: at === null ? "—" : nums[at], "len(low)": low.length, "len(high)": high.length },
      highlights: [...(at === null ? [] : hl("current", ai(at))), ...extra],
    });

  /** Push with sift-up; each swap becomes a step on `line`. */
  function* push(h: HeapItem[], it: HeapItem, less: Less, line: string, what: string): Generator<Step<TreeState>, void, unknown> {
    h.push(it);
    t.count("pushes");
    yield snap(line, `${what}: push ${it.v} into ${h === low ? "low" : "high"}.`, hl("active", tn(it.id)));
    for (const ev of siftUpEvents(h, h.length - 1, less)) {
      if (ev.type === "compare") t.count("comparisons");
      if (ev.type === "swap") {
        t.count("swaps");
        yield snap(line, `It rises above ${h[ev.i].v} (sift up).`, hl("swap", tn(h[ev.j].id), tn(h[ev.i].id)));
      }
    }
  }
  /** Pop the root with sift-down; returns the removed item. */
  function* pop(h: HeapItem[], less: Less, line: string, what: string): Generator<Step<TreeState>, HeapItem, unknown> {
    const top = h[0];
    yield snap(line, `${what}: take ${top.v}, the root of ${h === low ? "low (its maximum)" : "high (its minimum)"}.`, hl("removed", tn(top.id)));
    const last = h.pop()!;
    t.count("pops");
    if (h.length) {
      h[0] = last;
      for (const ev of siftDownEvents(h, 0, less)) {
        if (ev.type === "compare") t.count("comparisons");
        if (ev.type === "swap") {
          t.count("swaps");
          yield snap(line, `Refill the root: ${h[ev.j].v} sinks below ${h[ev.i].v}.`, hl("swap", tn(h[ev.i].id), tn(h[ev.j].id)));
        }
      }
    }
    return top;
  }

  yield snap("init", "Two empty heaps: low keeps the smaller half (max on top), high the larger half (min on top).");

  for (let i = 0; i < nums.length; i++) {
    at = i;
    const x = nums[i];
    yield* push(low, { id: nextId++, v: x }, maxFirst, "add-low", `addNum(${x})`);
    const moved = yield* pop(low, maxFirst, "move-high", "Move low's max to high");
    yield* push(high, moved, minFirst, "move-high", `${moved.v} is now known to belong to the larger half`);
    t.count("comparisons");
    if (high.length > low.length) {
      yield snap("rebalance", `high has ${high.length}, low has ${low.length}: high is too big.`);
      const back = yield* pop(high, minFirst, "move-low", "Move high's min back");
      yield* push(low, back, maxFirst, "move-low", `${back.v} returns to the smaller half`);
    } else {
      yield snap("rebalance", `Sizes are fine: low ${low.length}, high ${high.length}.`);
    }
    t.count("comparisons");
    if (low.length > high.length) {
      medians.push(low[0].v);
      yield snap("median", `${i + 1} values (odd): the median is low's max, ${low[0].v}.`, [...hl("found", tn(low[0].id), ai(medians.length - 1, 1))]);
    } else {
      const m = (low[0].v + high[0].v) / 2;
      medians.push(m);
      yield snap("median-even", `${i + 1} values (even): the median is (${low[0].v} + ${high[0].v}) / 2 = ${m}.`, [...hl("found", tn(low[0].id), tn(high[0].id), ai(medians.length - 1, 1))]);
    }
  }
  at = null;
  yield snap(
    medians.length % 2 ? "median" : "median-even",
    `${nums.length === 1 ? "The only value is" : `All ${nums.length} values are`} added. Medians after each one: [${medians.join(", ")}].`,
    [],
    medians.slice(),
  );
}

const algorithm: AlgorithmModule<Input, TreeState> = {
  ...meta,
  renderer: "tree",
  inputSchema: { fields: [numbersField("nums", "stream", { minLength: 1, maxLength: 12 })] },
  presets: [
    { name: "LeetCode example: 1, 2, 3", input: { nums: [1, 2, 3] } },
    { name: "Mixed stream", input: { nums: [5, 15, 1, 3, 8, 7, 9, 10] } },
    { name: "Edge case: one value", input: { nums: [4] } },
    { name: "Increasing stream (always rebalances)", input: { nums: [1, 2, 3, 4, 5, 6, 7, 8] } },
    { name: "Decreasing stream", input: { nums: [8, 7, 6, 5, 4, 3, 2, 1] } },
  ],
  randomInput: (size, rng = Math.random) => ({ nums: randomNumbers(rng, size, -10, 20, 12) }),
  code: { python, javascript },
  generate,
  reference: ({ nums }) =>
    nums.map((_, i) => {
      const s = nums.slice(0, i + 1).sort((a, b) => a - b);
      const m = s.length >> 1;
      return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
    }),
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "x (new value)", active: "Just pushed", swap: "Sift swap", removed: "Root being taken", found: "Median" },
};

export default algorithm;
