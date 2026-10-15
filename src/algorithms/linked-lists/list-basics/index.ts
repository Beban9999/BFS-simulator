import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { pick, randInt } from "../../../engine/random";
import { ListModel, arrowList, eid, listField, nid, pid, randomList, type ListPointer, type ListState, type NodeId } from "../../_shared/list";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

type Op = "search" | "insert" | "delete";

interface Input {
  head: number[];
  op: Op;
  index: number;
  value: number;
  kind: "singly" | "doubly";
}

/** Insert/delete results: the values forwards and (doubly) backwards from the tail via prev. */
type Output = { index: number } | { values: (number | string)[]; backwards: (number | string)[] | null };

function* generate({ head: vals, op, index, value, kind }: Input) {
  const t = new Tracer<ListState>();
  const doubly = kind === "doubly";
  const m = new ListModel(2);
  if (doubly) m.prev = {};
  let head = m.chain(vals);
  const v = (id: NodeId | null) => (id === null ? "null" : m.val(id));
  const caption =
    (doubly ? "Doubly linked (upper arrow = next, lower = prev) · " : "Singly linked · ") +
    (op === "search" ? `search(${value})` : op === "insert" ? `insert_at(${index}, ${value})` : `delete_at(${index})`);

  const snap = (ptrs: ListPointer[], extra: Highlight[] = [], vars: Record<string, unknown> = {}, result?: Output) => ({
    state: m.state({ pointers: [{ name: "head", node: head }, ...ptrs], caption, result }),
    vars: { ...Object.fromEntries(ptrs.map((p) => [p.name, v(p.node)])), ...vars },
    highlights: extra,
  });
  const backwards = () => {
    if (!doubly) return null;
    const ids = m.ids(head);
    const out: (number | string)[] = [];
    for (let c: NodeId | null = ids.length ? ids[ids.length - 1] : null; c !== null && out.length <= ids.length; c = m.prev![c]) out.push(m.val(c));
    return out;
  };
  function* finish(line: string, message: string) {
    m.layout(0, head);
    m.rows[1] = [];
    const values = m.values(head);
    yield t.step(line, `${message} The list is now ${arrowList(values)}.`, snap([], hl("sorted", ...m.ids(head).map(nid)), {}, { values, backwards: backwards() }));
  }

  if (op === "search") {
    let curr = head;
    let i = 0;
    yield t.step("s-init", `Start at the head with i = 0, looking for ${value}.`, snap([{ name: "curr", node: curr }], [], { i, target: value }));
    while (true) {
      t.count("comparisons");
      if (curr === null) {
        yield t.step("s-loop", `curr is null — the walk passed the last node.`, snap([{ name: "curr", node: curr }], [], { i, target: value }));
        yield t.step("s-missing", `${value} is not in the list. Return -1.`, snap([], hl("pruned", ...m.ids(head).map(nid)), { target: value }, { index: -1 }));
        return;
      }
      yield t.step("s-loop", `curr is node ${i} (${v(curr)}).`, snap([{ name: "curr", node: curr }], hl("current", nid(curr)), { i, target: value }));
      t.count("comparisons");
      const hit = m.val(curr) === value;
      yield t.step("s-check", `${v(curr)} ${hit ? "==" : "≠"} ${value}.`, snap([{ name: "curr", node: curr }], hl(hit ? "found" : "compare", nid(curr)), { i, target: value }));
      if (hit) {
        yield t.step("s-found", `Found ${value} at position ${i} after ${i + 1} comparison${i ? "s" : ""}. Return ${i}.`, snap([{ name: "curr", node: curr }], hl("found", nid(curr)), { i, target: value }, { index: i }));
        return;
      }
      const from = curr;
      curr = m.next[curr];
      i++;
      t.count("accesses");
      yield t.step("s-move", `Follow next: curr = ${v(curr)}, i = ${i}. There is no shortcut — every position costs one hop.`, snap([{ name: "curr", node: curr }], [...hl("visited", nid(from)), ...hl("current", curr !== null && nid(curr))], { i, target: value }));
    }
  }

  if (op === "insert") {
    const node = m.add(value, null, { label: "new" });
    m.place(node, 1, index);
    yield t.step("i-new", `Create a new node ${value}. It is not linked to anything yet.`, snap([{ name: "node", node }], hl("current", nid(node))));
    if (index === 0) {
      m.next[node] = head;
      t.count("writes");
      yield t.step("i-head", `Inserting at position 0: node.next = head (${v(head)}).`, snap([{ name: "node", node }], [...hl("current", nid(node)), ...(head !== null ? hl("swap", eid(node, head)) : [])]));
      if (doubly && head !== null) {
        m.prev![head] = node;
        t.count("writes");
        yield t.step("i-head-prev", `Doubly linked: the old head's prev = node, so it can step back to the new head.`, snap([{ name: "node", node }], [...hl("current", nid(node)), ...hl("swap", pid(head, node))]));
      }
      head = node;
      yield* finish("i-head-done", `Return node: ${value} is the new head.`);
      return;
    }
    let prev = head!;
    yield t.step("i-walk-init", `prev = head (${v(prev)}). We need the node at position ${index - 1}, just before the slot.`, snap([{ name: "node", node }, { name: "prev", node: prev }], hl("current", nid(prev))));
    for (let i = 1; i <= index - 1; i++) {
      prev = m.next[prev]!;
      t.count("accesses");
      yield t.step("i-walk", `prev = prev.next → ${v(prev)} (position ${i}).`, snap([{ name: "node", node }, { name: "prev", node: prev }], hl("current", nid(prev))));
    }
    const after = m.next[prev];
    m.next[node] = after;
    t.count("writes");
    yield t.step(
      "i-link-next",
      after === null ? `node.next = prev.next = null: the new node will be the tail.` : `node.next = prev.next: the new node points at ${v(after)} first, so nothing gets lost.`,
      snap([{ name: "node", node }, { name: "prev", node: prev }], [...hl("current", nid(node)), ...(after !== null ? hl("swap", eid(node, after)) : [])]),
    );
    m.next[prev] = node;
    t.count("writes");
    yield t.step("i-link", `prev.next = node: ${v(prev)} → ${value}${after !== null ? ` → ${v(after)}` : ""}. The node is in the chain.`, snap([{ name: "node", node }, { name: "prev", node: prev }], [...hl("current", nid(node)), ...hl("swap", eid(prev, node))]));
    if (doubly) {
      m.prev![node] = prev;
      t.count("writes");
      yield t.step("i-prev", `Doubly linked: node.prev = ${v(prev)}.`, snap([{ name: "node", node }, { name: "prev", node: prev }], [...hl("current", nid(node)), ...hl("swap", pid(node, prev))]));
      if (after !== null) {
        m.prev![after] = node;
        t.count("writes");
        yield t.step("i-next-prev", `Doubly linked: ${v(after)}.prev = node, replacing its old link back to ${v(prev)}.`, snap([{ name: "node", node }, { name: "prev", node: prev }], [...hl("current", nid(node)), ...hl("swap", pid(after, node))]));
      }
    }
    yield* finish("i-done", `Return head. Only ${doubly ? (after !== null ? 4 : 3) : 2} pointers changed — no values were shifted.`);
    return;
  }

  // delete
  const order = m.ids(head);
  if (index === 0) {
    const target = head!;
    const newHead = m.next[target];
    m.place(target, 1, 0);
    yield t.step("d-head", `Deleting position 0: new_head = head.next (${v(newHead)}).`, snap([{ name: "new_head", node: newHead }], hl("removed", nid(target))));
    if (doubly && newHead !== null) {
      m.prev![newHead] = null;
      t.count("writes");
      yield t.step("d-head-prev", `Doubly linked: new_head.prev = null — nothing comes before the head any more.`, snap([{ name: "new_head", node: newHead }], [...hl("removed", nid(target)), ...hl("swap", nid(newHead))]));
    }
    head = newHead;
    m.hide(target);
    yield* finish("d-head-done", `Return new_head. The old head ${v(target)} is unreachable (garbage).`);
    return;
  }
  let prev = head!;
  yield t.step("d-walk-init", `prev = head (${v(prev)}). We need the node at position ${index - 1}, just before the target.`, snap([{ name: "prev", node: prev }], hl("current", nid(prev))));
  for (let i = 1; i <= index - 1; i++) {
    prev = m.next[prev]!;
    t.count("accesses");
    yield t.step("d-walk", `prev = prev.next → ${v(prev)} (position ${i}).`, snap([{ name: "prev", node: prev }], hl("current", nid(prev))));
  }
  const target = m.next[prev]!;
  yield t.step("d-target", `target = prev.next = ${v(target)} (position ${index}).`, snap([{ name: "prev", node: prev }, { name: "target", node: target }], [...hl("current", nid(prev)), ...hl("removed", nid(target))]));
  const after = m.next[target];
  m.next[prev] = after;
  t.count("writes");
  m.place(target, 1, order.indexOf(target));
  yield t.step(
    "d-unlink",
    after === null ? `prev.next = target.next = null: ${v(prev)} is the new tail.` : `prev.next = target.next: ${v(prev)} now skips straight to ${v(after)}.`,
    snap([{ name: "prev", node: prev }, { name: "target", node: target }], [...hl("removed", nid(target)), ...(after !== null ? hl("swap", eid(prev, after)) : hl("swap", nid(prev)))]),
  );
  if (doubly && after !== null) {
    m.prev![after] = prev;
    t.count("writes");
    yield t.step("d-prev", `Doubly linked: ${v(after)}.prev = ${v(prev)}, so the backward chain skips the target too.`, snap([{ name: "prev", node: prev }, { name: "target", node: target }], [...hl("removed", nid(target)), ...hl("swap", pid(after, prev))]));
  }
  m.hide(target);
  yield* finish("d-done", `Return head. ${v(target)} is no longer reachable.`);
}

const algorithm: AlgorithmModule<Input, ListState> = {
  ...meta,
  renderer: "linkedlist",
  inputSchema: {
    fields: [
      listField("head", "list", { maxLength: 8 }),
      {
        key: "op",
        label: "operation",
        kind: "select",
        options: [
          { value: "search", label: "Search for value" },
          { value: "insert", label: "Insert value at index" },
          { value: "delete", label: "Delete at index" },
        ],
      },
      { key: "index", label: "index", kind: "number", integer: true, min: 0, max: 8, help: "Position for insert / delete (0 = head)." },
      { key: "value", label: "value", kind: "number", integer: true, min: -99, max: 99, help: "Value to search for or insert." },
      {
        key: "kind",
        label: "list type",
        kind: "select",
        options: [
          { value: "singly", label: "Singly linked" },
          { value: "doubly", label: "Doubly linked" },
        ],
      },
    ],
    validate: ({ head, op, index }) => {
      if (op === "insert" && index > head.length) return `Insert index must be between 0 and ${head.length}.`;
      if (op === "insert" && head.length >= 8) return "The list is full for this demo (8 nodes).";
      if (op === "delete" && head.length === 0) return "Cannot delete from an empty list.";
      if (op === "delete" && index >= head.length) return `Delete index must be between 0 and ${head.length - 1}.`;
      return null;
    },
  },
  presets: [
    { name: "Insert 9 at index 2 (singly)", input: { head: [3, 1, 4, 6, 5], op: "insert", index: 2, value: 9, kind: "singly" } },
    { name: "Delete index 2 (doubly)", input: { head: [3, 1, 4, 6, 5], op: "delete", index: 2, value: 0, kind: "doubly" } },
    { name: "Search: value is missing (worst case)", input: { head: [3, 1, 4, 1, 5, 9, 2, 6], op: "search", index: 0, value: 7, kind: "singly" } },
    { name: "Edge case: insert into an empty list", input: { head: [], op: "insert", index: 0, value: 42, kind: "doubly" } },
    { name: "Edge case: delete the head (doubly)", input: { head: [8, 6, 7], op: "delete", index: 0, value: 0, kind: "doubly" } },
    { name: "Insert at the tail (doubly)", input: { head: [1, 2, 3], op: "insert", index: 3, value: 4, kind: "doubly" } },
  ],
  randomInput: (size, rng = Math.random) => {
    const head = randomList(rng, size, 0, 9, 7);
    const op: Op = head.length === 0 ? pick(rng, ["search", "insert"] as const) : pick(rng, ["search", "insert", "delete"] as const);
    const index = op === "insert" ? randInt(rng, 0, head.length) : op === "delete" ? randInt(rng, 0, head.length - 1) : 0;
    return { head, op, index, value: randInt(rng, 0, 9), kind: rng() < 0.5 ? "singly" : "doubly" };
  },
  code: { python, javascript },
  generate,
  reference: ({ head, op, index, value, kind }) => {
    if (op === "search") return { index: head.indexOf(value) };
    const values = head.slice();
    if (op === "insert") values.splice(index, 0, value);
    else values.splice(index, 1);
    return { values, backwards: kind === "doubly" ? values.slice().reverse() : null };
  },
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "curr / prev / new node", compare: "Checked, no match", visited: "Walked past", found: "Found", removed: "Being deleted", swap: "Pointer just changed", sorted: "Resulting list", pruned: "Not found" },
};

export default algorithm;
