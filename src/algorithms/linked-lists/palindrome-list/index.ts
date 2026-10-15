import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { ListModel, eid, listField, nid, randomList, type ListPointer, type ListState, type NodeId } from "../../_shared/list";
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
  const v = (id: NodeId | null) => (id === null ? "null" : m.val(id));
  const matched: NodeId[] = [];

  const snap = (ptrs: ListPointer[], extra: Highlight[] = [], vars: Record<string, unknown> = {}, result?: boolean) => ({
    state: m.state({ pointers: ptrs, result }),
    vars: { ...Object.fromEntries(ptrs.map((p) => [p.name, v(p.node)])), ...vars },
    highlights: [...hl("match", ...matched.map(nid)), ...extra],
  });

  // 1) middle
  let slow = head;
  let fast = head;
  yield t.step("init", `Phase 1 — find the middle. slow and fast both start at the head (${v(head)}).`, snap([{ name: "slow", node: slow }, { name: "fast", node: fast }]));
  while (true) {
    t.count("comparisons");
    const go = fast !== null && m.next[fast] !== null;
    yield t.step(
      "mid-loop",
      go ? `fast (${v(fast)}) has a next node, so fast can jump two steps.` : fast === null ? "fast is null — slow is at the middle." : `fast (${v(fast)}) is the last node — slow (${v(slow)}) is at the middle.`,
      snap([{ name: "slow", node: slow }, { name: "fast", node: fast }], hl("current", slow !== null && nid(slow))),
    );
    if (!go) break;
    slow = m.next[slow!];
    fast = m.next[m.next[fast!]!];
    yield t.step("mid-move", `slow moves 1 → ${v(slow)}, fast moves 2 → ${v(fast)}.`, snap([{ name: "slow", node: slow }, { name: "fast", node: fast }], hl("current", slow !== null && nid(slow))));
  }

  // 2) reverse second half
  const secondHalf = m.ids(slow);
  let prev: NodeId | null = null;
  let curr = slow;
  yield t.step(
    "rev-init",
    slow === null ? "The list is empty — nothing to reverse." : `Phase 2 — reverse the second half [${secondHalf.map((id) => m.val(id)).join(", ")}], starting at slow.`,
    snap([{ name: "prev", node: prev }, { name: "curr", node: curr }], hl("window", ...secondHalf.map(nid))),
  );
  while (curr !== null) {
    const nxt: NodeId | null = m.next[curr];
    m.next[curr] = prev;
    t.count("writes");
    yield t.step(
      "rev-flip",
      prev === null ? `${m.val(curr)}.next = null: it will be the end of the reversed half.` : `${m.val(curr)}.next = ${m.val(prev)}: flip the arrow backwards.`,
      snap([{ name: "prev", node: curr }, { name: "curr", node: nxt }], [...hl("window", ...secondHalf.map(nid)), ...hl("swap", prev !== null && eid(curr, prev))]),
    );
    prev = curr;
    curr = nxt;
  }

  // 3) compare
  let left = head;
  let right = prev;
  yield t.step(
    "cmp-init",
    right === null ? "Phase 3 — nothing to compare." : `Phase 3 — left starts at the head (${v(left)}), right at the old tail (${v(right)}). Walk them towards the middle.`,
    snap([{ name: "left", node: left }, { name: "right", node: right }]),
  );
  while (right !== null) {
    t.count("comparisons");
    const same = m.val(left!) === m.val(right);
    yield t.step(
      "compare",
      left === right ? `left and right meet at the middle node ${m.val(right)} — it mirrors itself.` : `Compare left = ${m.val(left!)} with right = ${m.val(right)}: ${same ? "equal" : "different"}.`,
      snap([{ name: "left", node: left }, { name: "right", node: right }], hl(same ? "match" : "mismatch", nid(left!), nid(right))),
    );
    if (!same) {
      yield t.step("mismatch", `${m.val(left!)} ≠ ${m.val(right)}, so the list is not a palindrome. Return False.`, snap([{ name: "left", node: left }, { name: "right", node: right }], hl("mismatch", nid(left!), nid(right)), {}, false));
      return;
    }
    matched.push(left!, right);
    left = m.next[left!];
    right = m.next[right];
    yield t.step("cmp-move", `They match. Move left → ${v(left)}, right → ${v(right)}.`, snap([{ name: "left", node: left }, { name: "right", node: right }]));
  }
  yield t.step("done", vals.length === 0 ? "An empty list reads the same both ways. Return True." : "right ran out and every mirrored pair matched. Return True.", snap([], [], {}, true));
}

const algorithm: AlgorithmModule<Input, ListState> = {
  ...meta,
  renderer: "linkedlist",
  inputSchema: { fields: [listField("head", "list")] },
  presets: [
    { name: "LeetCode example: 1→2→2→1", input: { head: [1, 2, 2, 1] } },
    { name: "Odd length palindrome", input: { head: [3, 1, 4, 1, 3] } },
    { name: "Not a palindrome (fails at the middle)", input: { head: [1, 2, 3, 4, 2, 1] } },
    { name: "Edge case: single node", input: { head: [5] } },
    { name: "Longest: 10-node palindrome", input: { head: [1, 2, 3, 4, 5, 5, 4, 3, 2, 1] } },
  ],
  randomInput: (size, rng = Math.random) => {
    const half = randomList(rng, Math.ceil(size / 2), 0, 3, 5);
    // Half of the random inputs are palindromes so both outcomes get exercised.
    if (rng() < 0.5) return { head: [...half, ...half.slice(0, size % 2 ? -1 : undefined).reverse()].slice(0, 10) };
    return { head: randomList(rng, size, 0, 3) };
  },
  code: { python, javascript },
  generate,
  reference: ({ head }) => head.every((x, i) => x === head[head.length - 1 - i]),
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "slow", window: "Second half", swap: "Just flipped", match: "Mirrored pair matches", mismatch: "Mismatch" },
};

export default algorithm;
