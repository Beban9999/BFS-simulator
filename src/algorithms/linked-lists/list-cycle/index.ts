import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { ListModel, eid, listField, nid, randomList, type ListState, type NodeId } from "../../_shared/list";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  head: number[];
  pos: number;
}

function* generate({ head: vals, pos }: Input) {
  const t = new Tracer<ListState>();
  const m = new ListModel();
  const head = m.chain(vals);
  const n = vals.length;
  if (n > 0 && pos >= 0) m.next[n - 1] = pos; // node ids are the indexes
  const cycle = n > 0 && pos >= 0 ? Array.from({ length: n - pos }, (_, i) => pos + i) : [];
  const back = n > 0 && pos >= 0 ? hl("path", eid(n - 1, pos)) : [];
  const label = (id: NodeId | null) => (id === null ? "null" : `${m.val(id)} (#${id})`);

  let slow = head;
  let fast = head;
  const snap = (extra: Highlight[] = [], result?: number) => ({
    state: m.state({
      pointers: [
        { name: "slow", node: slow },
        { name: "fast", node: fast },
      ],
      caption: pos < 0 ? "pos = -1: the tail points to null" : `pos = ${pos}: the tail links back to node #${pos}`,
      result,
    }),
    vars: { slow: label(slow), fast: label(fast) },
    highlights: [...hl("window", ...cycle.map(nid)), ...back, ...extra],
  });

  yield t.step("init", n === 0 ? "The list is empty: slow = fast = null." : `Phase 1 — slow and fast both start at the head ${label(head)}.`, snap());

  while (true) {
    t.count("comparisons");
    if (fast === null || m.next[fast] === null) {
      yield t.step("loop", fast === null ? "fast is null — it ran off the end of the list." : `fast is on ${label(fast)}, whose next is null — it reached the end.`, snap());
      yield t.step("no-cycle", "A list with a cycle has no end, so there is no cycle. Return null.", snap([], -1));
      return;
    }
    yield t.step("loop", `fast (${label(fast)}) and fast.next exist, so both pointers can move.`, snap());
    slow = m.next[slow!];
    fast = m.next[m.next[fast]!];
    t.count("accesses", 3);
    yield t.step("move", `slow → ${label(slow)} (1 step), fast → ${label(fast)} (2 steps).`, snap(hl("current", slow !== null && nid(slow), fast !== null && nid(fast))));
    t.count("comparisons");
    if (slow === fast) {
      yield t.step("meet", `slow and fast meet at ${label(slow)} — fast lapped slow, so there IS a cycle.`, snap(hl("found", nid(slow!))));
      const meetAt = slow!;
      slow = head;
      yield t.step("reset", `Phase 2 — move slow back to the head ${label(head)}; fast stays at the meeting point ${label(meetAt)}.`, snap(hl("current", nid(slow!), nid(fast!))));
      while (true) {
        t.count("comparisons");
        if (slow === fast) {
          yield t.step("phase2", `slow and fast are both on ${label(slow)}.`, snap(hl("found", nid(slow!))));
          break;
        }
        yield t.step("phase2", `slow (${label(slow)}) ≠ fast (${label(fast)}): keep going.`, snap(hl("current", nid(slow!), nid(fast!))));
        slow = m.next[slow!];
        fast = m.next[fast!];
        yield t.step("step2", `Both move one step: slow → ${label(slow)}, fast → ${label(fast)}.`, snap(hl("current", nid(slow!), nid(fast!))));
      }
      yield t.step("found", `The cycle starts at ${label(slow)}. Return that node (index ${slow}).`, snap(hl("found", nid(slow!)), slow!));
      return;
    }
  }
}

const algorithm: AlgorithmModule<Input, ListState> = {
  ...meta,
  renderer: "linkedlist",
  inputSchema: {
    fields: [
      listField("head", "list"),
      { key: "pos", label: "pos", kind: "number", integer: true, min: -1, max: 9, help: "Index the tail links back to; -1 = no cycle." },
    ],
    validate: ({ head, pos }) => (pos >= head.length ? `pos must be -1 or an index below ${head.length}.` : null),
  },
  presets: [
    { name: "LeetCode example: 3,2,0,-4 with pos 1", input: { head: [3, 2, 0, -4], pos: 1 } },
    { name: "No cycle", input: { head: [1, 2, 3, 4, 5], pos: -1 } },
    { name: "Edge case: one node pointing to itself", input: { head: [1], pos: 0 } },
    { name: "Long tail, short loop", input: { head: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], pos: 7 } },
    { name: "Whole list is the cycle", input: { head: [4, 8, 15, 16, 23, 42], pos: 0 } },
  ],
  randomInput: (size, rng = Math.random) => {
    const head = randomList(rng, size, 0, 9);
    return { head, pos: head.length === 0 || rng() < 0.3 ? -1 : randInt(rng, 0, head.length - 1) };
  },
  code: { python, javascript },
  generate,
  reference: ({ head, pos }) => (head.length > 0 && pos >= 0 ? pos : -1),
  outputOf: (s) => s.result,
  info,
  legendLabels: { window: "Nodes on the cycle", path: "Tail → back link", current: "slow / fast", found: "Meeting point / cycle start" },
};

export default algorithm;
