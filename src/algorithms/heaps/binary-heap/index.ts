import type { AlgorithmModule, Highlight, HighlightKind, Step } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { pick, randInt } from "../../../engine/random";
import { ai, randomNumbers } from "../../_shared/array";
import { parseOp } from "../../_shared/stackqueue";
import { heapView, minFirst, siftDownEvents, siftUpEvents, tn, type HeapItem, type TreeState } from "../../_shared/tree";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  nums: number[];
  ops: string[];
}

interface Output {
  popped: number[];
  contents: number[];
  valid: boolean;
}

function* generate({ nums, ops }: Input) {
  const t = new Tracer<TreeState>();
  let nextId = 0;
  const h: HeapItem[] = nums.map((v) => ({ id: nextId++, v }));
  const popped: number[] = [];
  let op: string | null = null;
  let opIdx = -1;

  const valid = () => h.every((it, i) => i === 0 || h[(i - 1) >> 1].v <= it.v);
  /** The same kind on a tree node and on its array cell. */
  const both = (kind: HighlightKind, ...idx: number[]): Highlight[] => idx.filter((i) => i >= 0 && i < h.length).flatMap((i) => hl(kind, tn(h[i].id), ai(i)));

  // The class-free code has no "done" line, so every step carries the answer so far.
  const snap = (ptrs: { name: string; index: number }[], extra: Highlight[] = []) => ({
    state: {
      trees: [heapView(h, "min-heap (tree view)", { pointers: ptrs })],
      array: {
        rows: [
          { label: "array", values: h.length ? h.map((it) => it.v) : [""], ids: h.length ? h.map((it) => it.id) : undefined },
          { label: "popped", values: popped.length ? popped : [""], hideIndex: true },
        ],
        pointers: ptrs.filter((p) => p.index >= 0 && p.index < h.length),
      },
      result: { popped: popped.slice(), contents: h.map((it) => it.v).sort((a, b) => a - b), valid: valid() } satisfies Output,
    },
    vars: { op: op ?? "build", n: h.length, "h[0]": h.length ? h[0].v : "—" },
    aux: ops.length ? [{ label: "operations", kind: "list" as const, items: ops, highlight: opIdx < 0 ? [] : [opIdx] }] : undefined,
    highlights: extra,
  });

  function* siftDown(i: number, why: string): Generator<Step<TreeState>, void, unknown> {
    for (const ev of siftDownEvents(h, i, minFirst)) {
      if (ev.type === "compare") {
        const l = 2 * ev.i + 1;
        const r = l + 1;
        const kids = [l, r].filter((c) => c < h.length);
        yield t.step(
          "down-pick",
          `${why}: ${h[ev.i].v} at [${ev.i}] has child${kids.length > 1 ? "ren" : ""} ${kids.map((c) => `${h[c].v}`).join(" and ")}; the smaller is ${h[ev.j].v}.`,
          snap([{ name: "i", index: ev.i }, { name: "child", index: ev.j }], [...both("current", ev.i), ...both("compare", ...kids)]),
        );
        t.count("comparisons", kids.length);
      } else if (ev.type === "swap") {
        t.count("swaps");
        yield t.step("down-swap", `${h[ev.i].v} < ${h[ev.j].v}: swap them — ${h[ev.j].v} sinks to [${ev.j}].`, snap([{ name: "i", index: ev.j }], both("swap", ev.i, ev.j)));
      } else {
        yield t.step(
          "down-check",
          ev.j === null ? `${h[ev.i].v} at [${ev.i}] is a leaf — it can't sink further.` : `${h[ev.i].v} ≤ its smaller child ${h[ev.j].v}: heap order holds, stop.`,
          snap([{ name: "i", index: ev.i }], both("found", ev.i)),
        );
      }
    }
  }

  yield t.step(
    "build-start",
    h.length ? `The array [${nums.join(", ")}] already has the shape of a complete tree, but parents aren't ≤ children yet. Build the heap bottom-up.` : "Start with an empty heap.",
    snap([]),
  );
  for (let i = (h.length >> 1) - 1; i >= 0; i--) {
    yield t.step("build", `Fix the subtree rooted at [${i}] (${h[i].v}); its children's subtrees are already heaps.`, snap([{ name: "i", index: i }], both("active", i)));
    yield* siftDown(i, "Build");
  }
  if (h.length > 1) yield t.step("build", `Build-heap done in O(n): the minimum ${h[0].v} is at the root.`, snap([], both("found", 0)));

  for (const [k, tok] of ops.entries()) {
    op = tok;
    opIdx = k;
    const [name, x] = parseOp(tok);
    if (name === "push") {
      const it = { id: nextId++, v: x! };
      h.push(it);
      t.count("writes");
      yield t.step("push", `push(${x}): append it as the next leaf at [${h.length - 1}] — the tree stays complete.`, snap([{ name: "i", index: h.length - 1 }], both("active", h.length - 1)));
      for (const ev of siftUpEvents(h, h.length - 1, minFirst)) {
        if (ev.type === "compare") {
          t.count("comparisons");
          yield t.step("up-parent", `Compare ${h[ev.i].v} at [${ev.i}] with its parent ${h[ev.j].v} at [${ev.j}].`, snap([{ name: "i", index: ev.i }, { name: "parent", index: ev.j }], [...both("current", ev.i), ...both("compare", ev.j)]));
        } else if (ev.type === "swap") {
          t.count("swaps");
          yield t.step("up-swap", `${h[ev.j].v} < ${h[ev.i].v}: swap — ${h[ev.j].v} rises to [${ev.j}].`, snap([{ name: "i", index: ev.j }], both("swap", ev.i, ev.j)));
        } else {
          yield t.step(
            "up-check",
            ev.j === null ? `${h[ev.i].v} reached the root: it is the new minimum.` : `Parent ${h[ev.j].v} ≤ ${h[ev.i].v}: heap order holds, stop.`,
            snap([{ name: "i", index: ev.i }], both("found", ev.i)),
          );
        }
      }
    } else {
      const last = h.length - 1;
      yield t.step("pop-swap", `pop(): the minimum ${h[0].v} is at the root. Swap it with the last leaf ${h[last].v} so it can be removed from the end.`, snap([], both("swap", 0, last)));
      [h[0], h[last]] = [h[last], h[0]];
      t.count("swaps");
      const min = h.pop()!;
      popped.push(min.v);
      yield t.step(
        "pop-remove",
        `Remove ${min.v} from the end and return it.${h.length ? ` The new root ${h[0].v} is probably too big — sift it down.` : " The heap is now empty."}`,
        snap([], [...both("active", 0), ...hl("found", ai(popped.length - 1, 1))]),
      );
      if (h.length) yield* siftDown(0, "Sift down");
    }
  }
}

function checkOps(nums: number[], ops: string[]): string | null {
  let size = nums.length;
  for (const tok of ops) {
    if (tok === "pop") {
      if (size === 0) return "pop is called on an empty heap.";
      size--;
    } else size++;
    if (size > 15) return "Keep the heap at 15 values or fewer.";
  }
  return null;
}

const algorithm: AlgorithmModule<Input, TreeState> = {
  ...meta,
  renderer: "tree",
  inputSchema: {
    fields: [
      { key: "nums", label: "initial values (build-heap)", kind: "numbers", integer: true, min: -99, max: 99, minLength: 0, maxLength: 12 },
      { key: "ops", label: "then operations", kind: "words", maxLength: 10, pattern: /^(push:-?\d{1,2}|pop)$/, patternHint: "must be push:x or pop" },
    ],
    validate: ({ nums, ops }) => checkOps(nums, ops),
  },
  presets: [
    { name: "Build a heap, then push and pop", input: { nums: [9, 4, 7, 1, 8, 2, 6], ops: ["push:3", "pop", "pop"] } },
    { name: "Build-heap worst case: descending", input: { nums: [15, 14, 13, 12, 11, 10, 9, 8, 7, 6], ops: [] } },
    { name: "Pushes only: new minimum rises to the root", input: { nums: [], ops: ["push:5", "push:3", "push:8", "push:1", "push:4", "push:0"] } },
    { name: "Pop everything = heap sort", input: { nums: [5, 2, 8, 1, 9, 3], ops: ["pop", "pop", "pop", "pop", "pop", "pop"] } },
    { name: "Edge case: single value", input: { nums: [7], ops: ["pop", "push:2"] } },
  ],
  randomInput: (size, rng = Math.random) => {
    const nums = randomNumbers(rng, Math.min(size, 10), 0, 30, 10);
    const ops: string[] = [];
    let n = nums.length;
    for (let i = 0; i < randInt(rng, 0, 6); i++) {
      const o = n === 0 || n >= 15 ? (n === 0 ? "push" : "pop") : pick(rng, ["push", "pop"]);
      ops.push(o === "push" ? `push:${randInt(rng, 0, 30)}` : "pop");
      n += o === "push" ? 1 : -1;
    }
    return { nums, ops };
  },
  code: { python, javascript },
  generate,
  reference: ({ nums, ops }): Output => {
    const bag = nums.slice();
    const popped: number[] = [];
    for (const tok of ops) {
      const [name, x] = parseOp(tok);
      if (name === "push") bag.push(x!);
      else {
        const m = Math.min(...bag);
        bag.splice(bag.indexOf(m), 1);
        popped.push(m);
      }
    }
    return { popped, contents: bag.sort((a, b) => a - b), valid: true };
  },
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "Node being sifted", compare: "Compared with", swap: "Swapped", found: "Settled / returned", active: "New leaf / subtree root" },
};

export default algorithm;
