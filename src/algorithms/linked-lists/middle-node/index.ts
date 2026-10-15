import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { ListModel, arrowList, listField, nid, randomList, type ListState, type NodeId } from "../../_shared/list";
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
  let slow: NodeId | null = head;
  let fast: NodeId | null = head;
  let steps = 0;
  const label = (id: NodeId | null) => (id === null ? "null" : `${m.val(id)} (#${id})`);
  const passed = () => (slow === null ? [] : Array.from({ length: slow }, (_, i) => i));

  const snap = (extra: Highlight[] = [], result?: unknown) => ({
    state: m.state({
      pointers: [
        { name: "slow", node: slow },
        { name: "fast", node: fast },
      ],
      result,
    }),
    vars: { slow: label(slow), fast: label(fast), steps },
    highlights: [...hl("visited", ...passed().map(nid)), ...hl("current", slow !== null && nid(slow)), ...hl("frontier", fast !== null && nid(fast)), ...extra],
  });

  yield t.step("init", `slow and fast both start at the head ${label(head)}.`, snap());
  while (true) {
    t.count("comparisons");
    if (fast === null || m.next[fast] === null) {
      yield t.step(
        "loop",
        fast === null ? `fast ran off the end (the length ${vals.length} is even).` : `fast is on the last node (the length ${vals.length} is odd) — it cannot jump two more.`,
        snap(),
      );
      break;
    }
    yield t.step("loop", `fast (${label(fast)}) has a next node, so it can jump two steps.`, snap());
    slow = m.next[slow!];
    fast = m.next[m.next[fast]!];
    steps++;
    t.count("accesses", 3);
    yield t.step("move", `Step ${steps}: slow → ${label(slow)}, fast → ${label(fast)}. slow has walked ${steps}, fast ${2 * steps}.`, snap());
  }
  const result = m.values(slow);
  yield t.step(
    "done",
    `Return slow = ${label(slow)}${vals.length % 2 === 0 ? " — the second of the two middle nodes" : ", the exact middle"}. From there: ${arrowList(result)}.`,
    snap(hl("found", nid(slow!)), result),
  );
}

const algorithm: AlgorithmModule<Input, ListState> = {
  ...meta,
  renderer: "linkedlist",
  inputSchema: { fields: [listField("head", "list", { minLength: 1 })] },
  presets: [
    { name: "LeetCode example: odd length", input: { head: [1, 2, 3, 4, 5] } },
    { name: "Even length (second middle)", input: { head: [1, 2, 3, 4, 5, 6] } },
    { name: "Edge case: single node", input: { head: [9] } },
    { name: "Edge case: two nodes", input: { head: [1, 2] } },
    { name: "Longest: 10 nodes", input: { head: [10, 20, 30, 40, 50, 60, 70, 80, 90, 99] } },
  ],
  randomInput: (size, rng = Math.random) => ({ head: randomList(rng, size, 0, 9, 10, 1) }),
  code: { python, javascript },
  generate,
  reference: ({ head }) => head.slice(Math.floor(head.length / 2)),
  outputOf: (s) => s.result,
  info,
  legendLabels: { visited: "Passed by slow", current: "slow", frontier: "fast", found: "Middle" },
};

export default algorithm;
