import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { ListModel, arrowList, eid, listField, nid, randomList, type ListState, type NodeId } from "../../_shared/list";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  head: number[];
  n: number;
}

const ordinal = (k: number) => `${k}${k === 2 ? "nd" : k === 3 ? "rd" : "th"}`;

function* generate({ head: vals, n }: Input) {
  const t = new Tracer<ListState>();
  const m = new ListModel(2);
  const dummy = m.add("·", 0, { ghost: true, label: "dummy" });
  m.next[dummy] = m.chain(vals);
  const target = vals.length - n + 1; // node id of the n-th from the end (ids: dummy 0, then 1..L)
  let slow: NodeId | null = dummy;
  let fast: NodeId | null = dummy;
  const v = (id: NodeId | null) => (id === null ? "null" : id === dummy ? "dummy" : m.val(id));
  const order = m.ids(dummy);
  const gap = () => {
    const a = order.indexOf(slow!);
    const b = fast === null ? order.length : order.indexOf(fast);
    return order.slice(a + 1, b);
  };

  const snap = (extra: Highlight[] = [], result?: unknown) => ({
    state: m.state({
      pointers: [
        { name: "slow", node: slow },
        { name: "fast", node: fast },
      ],
      caption: `n = ${n}: remove the ${n === 1 ? "last node" : `${ordinal(n)} node from the end`}`,
      result,
    }),
    vars: { n, slow: v(slow), fast: v(fast) },
    highlights: [...hl("window", ...gap().map(nid)), ...extra],
  });

  yield t.step("init", `Put a dummy before the head; slow = fast = dummy.`, snap());
  for (let i = 1; i <= n + 1; i++) {
    fast = m.next[fast!];
    t.count("accesses");
    yield t.step("gap", `Head start ${i} of ${n + 1}: fast → ${v(fast)}.${i === n + 1 ? ` Now ${n} node${n === 1 ? "" : "s"} sit${n === 1 ? "s" : ""} between slow and fast.` : ""}`, snap());
  }
  while (true) {
    t.count("comparisons");
    if (fast === null) {
      yield t.step("loop", `fast is null — it fell off the end, so slow (${v(slow)}) is right before the node to remove.`, snap(hl("removed", nid(target))));
      break;
    }
    yield t.step("loop", `fast (${v(fast)}) is not null yet.`, snap());
    slow = m.next[slow!];
    fast = m.next[fast];
    yield t.step("move", `Move both one step, keeping the gap: slow → ${v(slow)}, fast → ${v(fast)}.`, snap());
  }

  const after = m.next[target];
  m.next[slow!] = after;
  t.count("writes");
  m.place(target, 1, order.indexOf(target));
  yield t.step(
    "unlink",
    `slow.next = slow.next.next: ${v(slow)} now points to ${v(after)}, skipping ${m.val(target)}. Nothing points to ${m.val(target)} any more.`,
    snap([...hl("removed", nid(target)), ...(after !== null ? hl("swap", eid(slow!, after)) : hl("swap", nid(slow!)))]),
  );

  m.hide(target);
  m.layout(0, dummy);
  const result = m.values(m.next[dummy]);
  slow = fast = null;
  yield t.step("done", `Return dummy.next: ${arrowList(result)}.`, {
    state: m.state({ pointers: [{ name: "head", node: m.next[dummy] }], result }),
    vars: { result: arrowList(result) },
    highlights: [],
  });
}

const algorithm: AlgorithmModule<Input, ListState> = {
  ...meta,
  renderer: "linkedlist",
  inputSchema: {
    fields: [listField("head", "list", { minLength: 1 }), { key: "n", label: "n", kind: "number", integer: true, min: 1, max: 10 }],
    validate: ({ head, n }) => (n > head.length ? "n must be at most the list length." : null),
  },
  presets: [
    { name: "LeetCode example: n = 2", input: { head: [1, 2, 3, 4, 5], n: 2 } },
    { name: "Remove the last node (n = 1)", input: { head: [1, 2, 3], n: 1 } },
    { name: "Edge case: remove the head (n = length)", input: { head: [1, 2, 3, 4], n: 4 } },
    { name: "Edge case: single node", input: { head: [1], n: 1 } },
    { name: "Longest walk: 10 nodes, n = 1", input: { head: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], n: 1 } },
  ],
  randomInput: (size, rng = Math.random) => {
    const head = randomList(rng, size, 0, 9, 10, 1);
    return { head, n: randInt(rng, 1, head.length) };
  },
  code: { python, javascript },
  generate,
  reference: ({ head, n }) => head.filter((_, i) => i !== head.length - n),
  outputOf: (s) => s.result,
  info,
  legendLabels: { window: "Gap between slow and fast", removed: "Node to remove", swap: "New link" },
};

export default algorithm;
