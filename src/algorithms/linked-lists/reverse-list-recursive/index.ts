import type { AlgorithmModule, Frame, Highlight, Step } from "../../../engine/types";
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
  const first = m.chain(vals);
  const frames: Frame[] = [];
  const v = (id: NodeId | null) => (id === null ? "null" : m.val(id));

  const snap = (head: NodeId | null, newHead: NodeId | null, extra: Highlight[] = []) => ({
    state: m.state({
      pointers: [
        { name: "head", node: head },
        ...(newHead !== undefined && newHead !== null ? [{ name: "new_head", node: newHead }] : []),
      ],
      caption: newHead !== null ? `reversed rest: ${arrowList(m.values(newHead, vals.length))}` : undefined,
    }),
    vars: { head: v(head), ...(newHead !== null ? { new_head: v(newHead) } : {}) },
    callStack: frames.map((f) => ({ ...f })),
    highlights: [
      ...hl("sorted", ...(newHead !== null ? m.ids(newHead).map(nid) : [])),
      ...hl("current", head !== null && nid(head)),
      ...extra,
    ],
  });

  function* rec(head: NodeId | null): Generator<Step<ListState>, NodeId | null, unknown> {
    frames.push({ call: `reverse_list(${v(head)})` });
    t.count("calls");
    yield t.step("call", head === null ? "Call reverse_list(null)." : `Call reverse_list(${m.val(head)}): reverse ${arrowList(m.values(head))}.`, snap(head, null));
    t.count("comparisons");
    if (head === null || m.next[head] === null) {
      yield t.step(
        "base",
        head === null ? "head is null — an empty list is already reversed. Return null." : `${m.val(head)} has no next node — a single node is its own reverse. Return ${m.val(head)}; it will be the new head.`,
        snap(head, null, hl("found", head !== null && nid(head))),
      );
      frames.pop();
      return head;
    }
    const nx = m.next[head]!;
    yield t.step("base", `${m.val(head)} has a next node (${m.val(nx)}), so this is not a base case.`, snap(head, null));
    yield t.step("recurse", `Recurse on head.next = ${m.val(nx)}. This call waits until the rest is reversed.`, snap(head, null, hl("frontier", nid(nx), eid(head, nx))));
    const newHead = yield* rec(nx);
    yield t.step(
      "recurse",
      `Back in reverse_list(${m.val(head)}): the rest is reversed into ${arrowList(m.values(newHead, vals.length))}, and ${m.val(nx)} is its tail. ${m.val(head)} still points to ${m.val(nx)}.`,
      snap(head, newHead, hl("frontier", nid(nx), eid(head, nx))),
    );
    m.next[nx] = head;
    t.count("writes");
    yield t.step(
      "link-back",
      `head.next.next = head: ${m.val(nx)} now points back to ${m.val(head)}. For a moment ${m.val(head)} ⇄ ${m.val(nx)} form a 2-node loop.`,
      snap(head, newHead, hl("swap", eid(nx, head))),
    );
    m.next[head] = null;
    t.count("writes");
    yield t.step("cut", `head.next = null: cut the old forward arrow, so ${m.val(head)} is the new tail.`, snap(head, newHead, hl("swap", nid(head))));
    yield t.step("return", `Return new_head = ${v(newHead)} to the caller: ${arrowList(m.values(newHead))}.`, snap(head, newHead));
    frames.pop();
    return newHead;
  }

  const newHead = yield* rec(first);
  m.layout(0, newHead);
  const result = m.values(newHead);
  yield t.step("return", newHead === null ? "The outermost call returned null: the list was empty." : `The outermost call returned ${m.val(newHead)}. Reversed list: ${arrowList(result)}.`, {
    state: m.state({ pointers: [{ name: "head", node: newHead }], result }),
    vars: { result: arrowList(result) },
    callStack: [],
    highlights: hl("sorted", ...m.ids(newHead).map(nid)),
  });
}

const algorithm: AlgorithmModule<Input, ListState> = {
  ...meta,
  renderer: "linkedlist",
  inputSchema: { fields: [listField("head", "list", { maxLength: 8 })] },
  presets: [
    { name: "LeetCode example: 1→2→3→4→5", input: { head: [1, 2, 3, 4, 5] } },
    { name: "Two nodes", input: { head: [1, 2] } },
    { name: "Edge case: single node", input: { head: [7] } },
    { name: "Edge case: empty list", input: { head: [] } },
    { name: "Deepest (8 frames)", input: { head: [8, 7, 6, 5, 4, 3, 2, 1] } },
  ],
  randomInput: (size, rng = Math.random) => ({ head: randomList(rng, size, 0, 9, 8) }),
  code: { python, javascript },
  generate,
  reference: ({ head }) => head.slice().reverse(),
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "head (this call)", frontier: "head.next", swap: "Just re-wired", sorted: "Reversed rest", found: "Base case" },
};

export default algorithm;
