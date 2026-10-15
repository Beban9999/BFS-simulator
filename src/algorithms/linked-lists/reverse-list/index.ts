import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { ListModel, arrowList, eid, listField, nid, randomList, type ListState, type NodeId } from "../../_shared/list";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  head: number[];
}

function* generate({ head: vals }: Input) {
  const t = new Tracer<ListState>();
  const m = new ListModel();
  const head = m.chain(vals);
  let prev: NodeId | null = null;
  let curr: NodeId | null = head;
  let nxt: NodeId | null = null;
  const done: NodeId[] = [];

  const v = (id: NodeId | null) => (id === null ? "null" : m.val(id));
  const snap = (extra: Highlight[] = [], showNxt = true) => ({
    state: m.state({
      pointers: [
        { name: "prev", node: prev },
        { name: "curr", node: curr },
        ...(showNxt ? [{ name: "nxt", node: nxt }] : []),
      ],
      caption: `reversed: ${arrowList(m.values(prev))}`,
    }),
    vars: { prev: v(prev), curr: v(curr), ...(showNxt ? { nxt: v(nxt) } : {}) },
    highlights: [...hl("sorted", ...done.map(nid)), ...hl("current", curr !== null && nid(curr)), ...extra],
  });

  yield t.step(
    "init",
    head === null
      ? "The list is empty: prev = null, curr = null."
      : `prev = null (the reversed part is empty), curr = head (${m.val(head)}). Every node is still in the original order: ${arrowList(vals)}.`,
    snap([], false),
  );

  while (true) {
    t.count("comparisons");
    if (curr === null) {
      yield t.step("loop", `curr is null — every node has been flipped. Stop.`, snap([], false));
      break;
    }
    yield t.step("loop", `curr = ${m.val(curr)} is not null, so there is still a node to flip.`, snap([], false));

    nxt = m.next[curr];
    t.count("accesses");
    yield t.step(
      "save",
      nxt === null
        ? `Save nxt = curr.next = null: ${m.val(curr)} is the last node.`
        : `Save nxt = curr.next = ${m.val(nxt)} — once we flip ${m.val(curr)}'s arrow, nxt is our only way to reach ${arrowList(m.values(nxt))}.`,
      snap([...hl("frontier", nxt !== null && nid(nxt), nxt !== null && eid(curr, nxt))]),
    );

    m.next[curr] = prev;
    t.count("writes");
    yield t.step(
      "flip",
      prev === null
        ? `curr.next = prev = null: ${m.val(curr)} becomes the tail of the reversed list.`
        : `curr.next = prev: ${m.val(curr)} now points back to ${m.val(prev)} instead of ${v(nxt)}.`,
      snap([...hl("frontier", nxt !== null && nid(nxt)), ...hl("swap", prev !== null && eid(curr, prev))]),
    );

    prev = curr;
    done.push(curr);
    yield t.step("move-prev", `prev = curr = ${m.val(prev)}. The reversed part is now ${arrowList(m.values(prev))}.`, snap(hl("frontier", nxt !== null && nid(nxt))));

    curr = nxt;
    yield t.step(
      "move-curr",
      curr === null ? `curr = nxt = null — we walked off the end.` : `curr = nxt = ${m.val(curr)}: move on to the untouched rest.`,
      snap(),
    );
  }

  // Lay the nodes out in their new order so the result reads left to right.
  m.layout(0, prev);
  const result = m.values(prev);
  yield t.step(
    "done",
    prev === null ? "Return null — reversing an empty list gives an empty list." : `Return prev = ${m.val(prev)}, the new head: ${arrowList(result)}.`,
    {
      state: m.state({ pointers: [{ name: "head", node: prev }], result }),
      vars: { prev: v(prev) },
      highlights: hl("sorted", ...m.ids(prev).map(nid)),
    },
  );
}

const algorithm: AlgorithmModule<Input, ListState> = {
  ...meta,
  renderer: "linkedlist",
  inputSchema: { fields: [listField("head", "list")] },
  presets: [
    { name: "LeetCode example: 1→2→3→4→5", input: { head: [1, 2, 3, 4, 5] } },
    { name: "Two nodes", input: { head: [1, 2] } },
    { name: "Edge case: single node", input: { head: [7] } },
    { name: "Edge case: empty list", input: { head: [] } },
    { name: "Longest (10 nodes)", input: { head: [9, 8, 7, 6, 5, 4, 3, 2, 1, 0] } },
  ],
  randomInput: (size, rng = Math.random) => ({ head: randomList(rng, size) }),
  code: { python, javascript },
  generate,
  reference: ({ head }) => head.slice().reverse(),
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "curr", frontier: "nxt (saved rest)", swap: "Arrow just flipped", sorted: "Reversed part" },
};

export default algorithm;
