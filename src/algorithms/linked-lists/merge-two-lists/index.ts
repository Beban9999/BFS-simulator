import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { ListModel, arrowList, eid, listField, nid, randomList, type ListState, type NodeId } from "../../_shared/list";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  list1: number[];
  list2: number[];
}

function* generate({ list1: a, list2: b }: Input) {
  const t = new Tracer<ListState>();
  // The merged row sits between the inputs so links back into either list stay short.
  const m = new ListModel(3, ["list1", "merged", "list2"]);
  const dummy = m.add("·", 1, { ghost: true, label: "dummy" });
  m.rows[0].push(null);
  m.rows[2].push(null);
  let l1 = m.chain(a, 0);
  let l2 = m.chain(b, 2);
  let tail = dummy;
  const merged: NodeId[] = [];
  const v = (id: NodeId | null) => (id === null ? "null" : id === dummy ? "dummy" : m.val(id));

  const snap = (extra: Highlight[] = [], result?: unknown) => ({
    state: m.state({
      pointers: [
        { name: "list1", node: l1 },
        { name: "list2", node: l2 },
        { name: "tail", node: tail },
      ],
      result,
    }),
    vars: { "list1.val": l1 === null ? "null" : m.val(l1), "list2.val": l2 === null ? "null" : m.val(l2), tail: v(tail) },
    highlights: [...hl("sorted", ...merged.map(nid)), ...extra],
  });

  yield t.step("init", `Create a dummy node; tail = dummy. The merged list is dummy.next, empty for now.`, snap());

  while (true) {
    t.count("comparisons");
    if (l1 === null || l2 === null) {
      yield t.step("loop", `${l1 === null ? "list1" : "list2"} is empty — the loop stops.`, snap());
      break;
    }
    yield t.step("loop", `Both lists still have nodes: fronts are ${m.val(l1)} and ${m.val(l2)}.`, snap(hl("compare", nid(l1), nid(l2))));
    t.count("comparisons");
    const first = (m.val(l1) as number) <= (m.val(l2) as number);
    yield t.step(
      "compare",
      `${m.val(l1)} ${first ? "≤" : ">"} ${m.val(l2)}${m.val(l1) === m.val(l2) ? " (tie: take list1's node first, keeping the merge stable)" : ""} → take the node from ${first ? "list1" : "list2"}.`,
      snap(hl("compare", nid(l1), nid(l2))),
    );
    const node = first ? l1 : l2;
    m.next[tail] = node;
    t.count("writes");
    m.place(node, 1);
    merged.push(node);
    if (first) l1 = m.next[node];
    else l2 = m.next[node];
    yield t.step(
      first ? "take1" : "take2",
      `tail.next = ${m.val(node)}; ${first ? "list1" : "list2"} moves on to ${v(first ? l1 : l2)}.`,
      snap([...hl("current", nid(node)), ...hl("swap", eid(tail, node))]),
    );
    tail = node;
    yield t.step("advance", `tail = ${m.val(node)}. Merged so far: ${arrowList(merged.map((id) => m.val(id)))}.`, snap(hl("current", nid(node))));
  }

  const rest = l1 ?? l2;
  m.next[tail] = rest;
  t.count("writes");
  const restIds = m.ids(rest);
  for (const id of restIds) m.place(id, 1);
  merged.push(...restIds);
  yield t.step(
    "rest",
    rest === null ? "Both lists are used up — nothing left to attach." : `tail.next = ${m.val(rest)}: attach the rest [${restIds.map((id) => m.val(id)).join(", ")}] in one step — it is already sorted.`,
    snap(rest === null ? [] : [...hl("current", ...restIds.map(nid)), ...hl("swap", eid(tail, rest))]),
  );

  const result = m.values(m.next[dummy]);
  l1 = l2 = null;
  yield t.step("done", `Return dummy.next: ${arrowList(result)}.`, {
    ...snap([], result),
    state: m.state({ pointers: [{ name: "head", node: m.next[dummy] }], result }),
  });
}

const sortedList = (key: "list1" | "list2") => listField(key, key, { maxLength: 6, sorted: true, help: "Sorted node values, head first." });

const algorithm: AlgorithmModule<Input, ListState> = {
  ...meta,
  renderer: "linkedlist",
  inputSchema: { fields: [sortedList("list1"), sortedList("list2")] },
  presets: [
    { name: "LeetCode example", input: { list1: [1, 2, 4], list2: [1, 3, 4] } },
    { name: "Edge case: one list empty", input: { list1: [], list2: [0, 2, 5] } },
    { name: "No interleaving (list1 all smaller)", input: { list1: [1, 2, 3], list2: [7, 8, 9] } },
    { name: "Most comparisons: perfect zip", input: { list1: [1, 3, 5, 7, 9, 11], list2: [2, 4, 6, 8, 10, 12] } },
  ],
  randomInput: (size, rng = Math.random) => ({
    list1: randomList(rng, Math.ceil(size / 2), 0, 15, 6).sort((x, y) => x - y),
    list2: randomList(rng, Math.floor(size / 2) + (rng() < 0.5 ? 1 : 0), 0, 15, 6).sort((x, y) => x - y),
  }),
  code: { python, javascript },
  generate,
  reference: ({ list1, list2 }) => [...list1, ...list2].sort((x, y) => x - y),
  outputOf: (s) => s.result,
  info,
  legendLabels: { compare: "Fronts compared", current: "Just attached", swap: "New link", sorted: "Merged list" },
};

export default algorithm;
