import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { ListModel, arrowList, eid, nid, randomList, type ListState, type NodeId } from "../../_shared/list";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  lists: number[][];
}

interface Entry {
  node: NodeId;
  i: number;
}

function* generate({ lists }: Input) {
  const t = new Tracer<ListState>();
  const k = lists.length;
  // Merged row on top: links from it into the lists below enter their nodes from above.
  const m = new ListModel(k + 1, ["merged", ...lists.map((_, i) => `lists[${i}]`)]);
  const dummy = m.add("·", 0, { ghost: true, label: "dummy" });
  const heads = lists.map((vals, i) => {
    m.rows[i + 1].push(null);
    return m.chain(vals, i + 1);
  });
  const heap: Entry[] = []; // kept ordered by (val, i) — always a valid min-heap
  const merged: NodeId[] = [];
  let tail = dummy;
  const val = (id: NodeId) => m.val(id) as number;
  const v = (id: NodeId | null) => (id === null ? "null" : id === dummy ? "dummy" : m.val(id));

  const push = (e: Entry) => {
    heap.push(e);
    heap.sort((x, y) => val(x.node) - val(y.node) || x.i - y.i);
    t.count("pushes");
    // A sift-up compares at most once per heap level.
    let levels = 0;
    for (let s = heap.length; s > 1; s >>= 1) levels++;
    t.count("comparisons", levels);
  };
  const snap = (extra: Highlight[] = [], hi?: number, result?: unknown) => ({
    state: m.state({ pointers: [{ name: "tail", node: tail }], result }),
    vars: { "len(heap)": heap.length, tail: v(tail) },
    aux: [{ label: "min-heap (val, list)", kind: "heap" as const, items: heap.map((e) => `${m.val(e.node)} (list ${e.i})`), highlight: hi === undefined ? [] : [hi] }],
    highlights: [...hl("sorted", ...merged.map(nid)), ...hl("frontier", ...heap.map((e) => nid(e.node))), ...extra],
  });

  heads.forEach((h, i) => {
    if (h !== null) push({ node: h, i });
  });
  yield t.step(
    "seed",
    k === 0 ? "There are no lists — the heap stays empty." : `Push the head of every non-empty list into the heap: ${heap.map((e) => m.val(e.node)).join(", ") || "none"}.`,
    snap(),
  );
  yield t.step("init", `Create a dummy node; tail = dummy.`, snap());

  while (true) {
    if (heap.length === 0) {
      yield t.step("loop", "The heap is empty — every node has been attached.", snap());
      break;
    }
    yield t.step("loop", `The heap still holds ${heap.length} front node${heap.length === 1 ? "" : "s"}.`, snap());
    const { node, i } = heap.shift()!;
    t.count("pops");
    yield t.step("pop", `Pop the smallest front: ${m.val(node)} from list ${i}.`, snap(hl("current", nid(node))));
    m.next[tail] = node;
    t.count("writes");
    m.place(node, 0);
    merged.push(node);
    yield t.step("attach", `tail.next = ${m.val(node)}, then tail moves to it. Merged so far: ${arrowList(merged.map((id) => m.val(id)))}.`, {
      ...snap([...hl("current", nid(node)), ...hl("swap", eid(tail, node))]),
    });
    tail = node;
    const nx = m.next[node];
    if (nx !== null) {
      push({ node: nx, i });
      yield t.step("push", `${m.val(node)} had a successor: push ${m.val(nx)}, the new front of list ${i}.`, snap(hl("current", nid(nx)), heap.findIndex((e) => e.node === nx)));
    }
  }

  const result = m.values(m.next[dummy]);
  yield t.step("done", result.length ? `Return dummy.next: ${arrowList(result)}.` : "Return null — all lists were empty.", {
    ...snap([], undefined, result),
    state: m.state({ pointers: [{ name: "head", node: m.next[dummy] }], result }),
  });
}

const algorithm: AlgorithmModule<Input, ListState> = {
  ...meta,
  renderer: "linkedlist",
  inputSchema: {
    fields: [
      {
        key: "lists",
        label: "lists",
        kind: "matrix",
        maxRows: 4,
        maxCols: 5,
        min: -99,
        max: 99,
        rectangular: false,
        help: "One sorted list per line (JSON like [[1,4],[],[2]] also works, including empty lists).",
      },
    ],
    validate: ({ lists }) =>
      lists.some((r) => r.some((x, j) => j > 0 && x < r[j - 1])) ? "Every list must be sorted ascending." : lists.some((r) => r.some((x) => !Number.isInteger(x))) ? "Use whole numbers." : null,
  },
  presets: [
    { name: "LeetCode example (3 lists)", input: { lists: [[1, 4, 5], [1, 3, 4], [2, 6]] } },
    { name: "Edge case: one list", input: { lists: [[2, 4, 6]] } },
    { name: "Edge case: no lists", input: { lists: [] } },
    { name: "Many ties (4 lists)", input: { lists: [[1, 2, 2], [1, 2], [2, 3, 3], [1]] } },
    { name: "Largest: 4 × 5 interleaved", input: { lists: [[1, 5, 9, 13, 17], [2, 6, 10, 14, 18], [3, 7, 11, 15, 19], [4, 8, 12, 16, 20]] } },
  ],
  randomInput: (size, rng = Math.random) => {
    const k = randInt(rng, 1, 4);
    return { lists: Array.from({ length: k }, () => randomList(rng, randInt(rng, 0, Math.min(5, size)), 0, 12, 5).sort((a, b) => a - b)) };
  },
  code: { python, javascript },
  generate,
  reference: ({ lists }) => lists.flat().sort((a, b) => a - b),
  outputOf: (s) => s.result,
  info,
  legendLabels: { frontier: "In the heap (list fronts)", current: "Popped / pushed", swap: "New link", sorted: "Merged list" },
};

export default algorithm;
