import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { ListModel, arrowList, eid, listField, nid, randomList, type ListPointer, type ListState, type NodeId } from "../../_shared/list";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  head: number[];
}

function* generate({ head: vals }: Input) {
  const t = new Tracer<ListState>();
  const m = new ListModel(2, ["first half", "second half"]);
  const head = m.chain(vals)!;
  const v = (id: NodeId | null) => (id === null ? "null" : m.val(id));
  let placed: NodeId[] = [];

  const snap = (ptrs: ListPointer[], extra: Highlight[] = [], result?: unknown) => ({
    state: m.state({ pointers: ptrs, result }),
    vars: Object.fromEntries(ptrs.map((p) => [p.name, v(p.node)])),
    highlights: [...hl("sorted", ...placed.map(nid)), ...extra],
  });

  // 1) first middle
  let slow = head;
  let fast = m.next[head];
  yield t.step("init", `Phase 1 — slow = head (${v(slow)}), fast = head.next (${v(fast)}). Starting fast one ahead makes slow stop on the first middle.`, snap([{ name: "slow", node: slow }, { name: "fast", node: fast }]));
  while (true) {
    t.count("comparisons");
    if (fast === null || m.next[fast] === null) {
      yield t.step("find-mid", `fast can't jump two more — slow (${v(slow)}) is the end of the first half.`, snap([{ name: "slow", node: slow }, { name: "fast", node: fast }], hl("current", nid(slow))));
      break;
    }
    slow = m.next[slow]!;
    fast = m.next[m.next[fast]!];
    yield t.step("find-mid", `slow → ${v(slow)}, fast → ${v(fast)}.`, snap([{ name: "slow", node: slow }, { name: "fast", node: fast }], hl("current", nid(slow))));
  }

  // 2) cut
  let second = m.next[slow];
  m.next[slow] = null;
  t.count("writes");
  const secondIds = m.ids(second);
  const firstLen = vals.length - secondIds.length;
  secondIds.forEach((id, i) => m.place(id, 1, firstLen + i));
  yield t.step(
    "cut",
    second === null
      ? "There is no second half (a single node) — nothing to reorder."
      : `Cut after ${v(slow)}: first half ${arrowList(m.values(head))}, second half ${arrowList(m.values(second))}.`,
    snap([{ name: "slow", node: slow }, { name: "second", node: second }], hl("window", ...secondIds.map(nid))),
  );

  // 3) reverse second half
  let prev: NodeId | null = null;
  while (second !== null) {
    const nxt: NodeId | null = m.next[second];
    m.next[second] = prev;
    t.count("writes");
    yield t.step(
      "reverse",
      `Reverse: ${v(second)}.next = ${v(prev)}; prev = ${v(second)}, second = ${v(nxt)}.`,
      snap([{ name: "prev", node: second }, { name: "second", node: nxt }], [...hl("window", ...secondIds.map(nid)), ...hl("swap", prev !== null && eid(second, prev))]),
    );
    prev = second;
    second = nxt;
  }

  // 4) weave
  let first: NodeId | null = head;
  second = prev;
  m.layout(1, prev, 0);
  m.layout(0, head, 0);
  yield t.step(
    "merge-init",
    `Phase 4 — weave. first = ${v(first)} (front of the first half), second = ${v(second)} (old tail, front of the reversed half).`,
    snap([{ name: "first", node: first }, { name: "second", node: second }]),
  );
  while (true) {
    t.count("comparisons");
    if (second === null) {
      yield t.step("merge-loop", "second is null — every back node has been woven in.", snap([{ name: "first", node: first }, { name: "second", node: second }]));
      break;
    }
    yield t.step("merge-loop", `second = ${v(second)} still has nodes to weave in.`, snap([{ name: "first", node: first }, { name: "second", node: second }], hl("current", nid(first!), nid(second))));
    const n1: NodeId | null = m.next[first!];
    const n2: NodeId | null = m.next[second];
    yield t.step("save", `Save n1 = ${v(n1)} and n2 = ${v(n2)} before changing any links.`, snap([{ name: "first", node: first }, { name: "second", node: second }, { name: "n1", node: n1 }, { name: "n2", node: n2 }], hl("current", nid(first!), nid(second))));
    m.next[first!] = second;
    t.count("writes");
    yield t.step("link1", `first.next = second: ${v(first)} → ${v(second)}.`, snap([{ name: "first", node: first }, { name: "second", node: second }, { name: "n1", node: n1 }, { name: "n2", node: n2 }], hl("swap", eid(first!, second))));
    m.next[second] = n1;
    t.count("writes");
    yield t.step(
      "link2",
      n1 === null ? `second.next = n1 = null: ${v(second)} is the new tail.` : `second.next = n1: ${v(second)} → ${v(n1)}.`,
      snap([{ name: "first", node: first }, { name: "second", node: second }, { name: "n1", node: n1 }, { name: "n2", node: n2 }], n1 !== null ? hl("swap", eid(second, n1)) : hl("swap", nid(second))),
    );
    placed.push(first!, second);
    first = n1;
    second = n2;
    yield t.step("advance", `first = n1 (${v(first)}), second = n2 (${v(second)}).`, snap([{ name: "first", node: first }, { name: "second", node: second }]));
  }

  placed = [];
  m.layout(0, head);
  m.rows[1] = [];
  const result = m.values(head);
  yield t.step("done", `Done in place: ${arrowList(result)}.`, snap([{ name: "head", node: head }], hl("sorted", ...m.ids(head).map(nid)), result));
}

const algorithm: AlgorithmModule<Input, ListState> = {
  ...meta,
  renderer: "linkedlist",
  inputSchema: { fields: [listField("head", "list", { minLength: 1 })] },
  presets: [
    { name: "LeetCode example: 1→2→3→4", input: { head: [1, 2, 3, 4] } },
    { name: "Odd length: 1→2→3→4→5", input: { head: [1, 2, 3, 4, 5] } },
    { name: "Edge case: single node", input: { head: [1] } },
    { name: "Edge case: two nodes", input: { head: [1, 2] } },
    { name: "Longest: 10 nodes", input: { head: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } },
  ],
  randomInput: (size, rng = Math.random) => ({ head: randomList(rng, size, 0, 9, 10, 1) }),
  code: { python, javascript },
  generate,
  reference: ({ head }) => {
    const out: number[] = [];
    for (let i = 0, j = head.length - 1; i <= j; i++, j--) {
      out.push(head[i]);
      if (i !== j) out.push(head[j]);
    }
    return out;
  },
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "slow / first & second", window: "Second half", swap: "Just re-wired", sorted: "In final order" },
};

export default algorithm;
