import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { ListModel, arrowList, eid, listField, nid, randomList, type ListPointer, type ListState, type NodeId } from "../../_shared/list";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  head: number[];
  k: number;
}

function* generate({ head: vals, k }: Input) {
  const t = new Tracer<ListState>();
  const m = new ListModel();
  const dummy = m.add("·", 0, { ghost: true, label: "dummy" });
  m.next[dummy] = m.chain(vals);
  const v = (id: NodeId | null) => (id === null ? "null" : id === dummy ? "dummy" : m.val(id));

  let groupPrev = dummy;
  let kth: NodeId | null = null;
  let groupNext: NodeId | null = null;
  let prev: NodeId | null = null;
  let curr: NodeId | null = null;
  const finished = new Set<NodeId>();
  let block: NodeId[] = [];

  const snap = (ptrs: ListPointer[], extra: Highlight[] = [], vars: Record<string, unknown> = {}) => ({
    state: m.state({ pointers: [{ name: "group_prev", node: groupPrev }, ...ptrs], caption: `k = ${k}` }),
    vars: { k, group_prev: v(groupPrev), ...vars },
    highlights: [...hl("sorted", ...[...finished].map(nid)), ...hl("window", ...block.map(nid)), ...extra],
  });

  yield t.step("init", `Put a dummy node before the head so the first group has a "node before it" too. group_prev = dummy.`, snap([]));

  for (let round = 1; ; round++) {
    kth = groupPrev;
    block = [];
    for (let i = 1; i <= k; i++) {
      kth = m.next[kth!];
      t.count("accesses");
      if (kth === null) {
        const result = m.values(m.next[dummy]);
        yield t.step(
          "find-kth",
          i === 1 ? `Step 1 of ${k} runs off the end: the list is used up.` : `Step ${i} of ${k} runs off the end: only ${i - 1} node${i === 2 ? "" : "s"} left, fewer than k.`,
          snap([{ name: "kth", node: null }], hl("pruned", ...block.map(nid))),
        );
        block = [];
        m.layout(0, dummy);
        yield t.step("done", `${i === 1 ? "No nodes are left." : "The short tail stays as it is."} Return dummy.next: ${arrowList(result)}.`, {
          state: m.state({ pointers: [{ name: "head", node: m.next[dummy] }], caption: `k = ${k}`, result }),
          vars: { k, result: arrowList(result) },
          highlights: hl("sorted", ...m.ids(m.next[dummy]).map(nid)),
        });
        return;
      }
      block.push(kth);
      yield t.step("find-kth", `Group ${round}: count ahead — step ${i} of ${k} reaches ${m.val(kth)}.`, snap([{ name: "kth", node: kth }], hl("current", nid(kth)), { kth: v(kth), i }));
    }

    groupNext = m.next[kth!];
    yield t.step(
      "group",
      `Group ${round} is [${block.map((id) => m.val(id)).join(", ")}]. Remember group_next = ${v(groupNext)}, the first node after it.`,
      snap([{ name: "kth", node: kth }, { name: "group_next", node: groupNext }], hl("frontier", groupNext !== null && nid(groupNext)), { kth: v(kth), group_next: v(groupNext) }),
    );

    prev = groupNext;
    curr = m.next[groupPrev];
    const ptrs = (): ListPointer[] => [
      { name: "prev", node: prev },
      { name: "curr", node: curr },
    ];
    yield t.step(
      "rev-init",
      `Reverse the group with prev = group_next (${v(groupNext)}) instead of null, so the group's new tail will already link to the rest.`,
      snap(ptrs(), hl("current", curr !== null && nid(curr)), { prev: v(prev), curr: v(curr) }),
    );
    while (curr !== groupNext) {
      const nxt: NodeId | null = m.next[curr!];
      m.next[curr!] = prev;
      t.count("writes");
      yield t.step(
        "rev-flip",
        `curr.next = prev: ${m.val(curr!)} now points to ${v(prev)}.`,
        snap(ptrs(), [...hl("current", nid(curr!)), ...hl("swap", prev !== null && eid(curr!, prev))], { prev: v(prev), curr: v(curr), nxt: v(nxt) }),
      );
      prev = curr;
      curr = nxt;
    }

    const firstNode = m.next[groupPrev]!;
    m.next[groupPrev] = kth;
    t.count("writes");
    yield t.step(
      "stitch",
      `${v(groupPrev)}.next = kth (${v(kth)}): the reversed group hangs off group_prev again. Its old first node ${m.val(firstNode)} is now its last.`,
      snap([{ name: "first", node: firstNode }], hl("swap", eid(groupPrev, kth!)), { first: v(firstNode), kth: v(kth) }),
    );

    for (const id of block) finished.add(id);
    block = [];
    m.layout(0, dummy);
    groupPrev = firstNode;
    yield t.step("next-group", `group_prev = ${m.val(firstNode)}. Group ${round} is done: ${arrowList(m.values(m.next[dummy]))}.`, snap([]));
  }
}

const algorithm: AlgorithmModule<Input, ListState> = {
  ...meta,
  renderer: "linkedlist",
  inputSchema: {
    fields: [listField("head", "list"), { key: "k", label: "k", kind: "number", integer: true, min: 1, max: 10 }],
    validate: ({ head, k }) => (head.length > 0 && k > head.length ? "k must be at most the list length." : null),
  },
  presets: [
    { name: "LeetCode example: k = 2", input: { head: [1, 2, 3, 4, 5], k: 2 } },
    { name: "k = 3 with a short tail", input: { head: [1, 2, 3, 4, 5, 6, 7, 8], k: 3 } },
    { name: "Edge case: k = 1 (unchanged)", input: { head: [1, 2, 3], k: 1 } },
    { name: "k = length (whole list)", input: { head: [1, 2, 3, 4, 5, 6], k: 6 } },
    { name: "Most work: 10 nodes, k = 5", input: { head: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], k: 5 } },
  ],
  randomInput: (size, rng = Math.random) => {
    const head = randomList(rng, size, 0, 9, 10, 1);
    return { head, k: randInt(rng, 1, head.length) };
  },
  code: { python, javascript },
  generate,
  reference: ({ head, k }) => {
    const out: number[] = [];
    for (let i = 0; i < head.length; i += k) {
      const chunk = head.slice(i, i + k);
      out.push(...(chunk.length === k ? chunk.reverse() : chunk));
    }
    return out;
  },
  outputOf: (s) => s.result,
  info,
  legendLabels: { window: "Current group", current: "kth / curr", frontier: "group_next", swap: "Just re-wired", sorted: "Finished groups", pruned: "Short tail (kept)" },
};

export default algorithm;
