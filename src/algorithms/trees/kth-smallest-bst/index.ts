import type { AlgorithmModule } from "../../../engine/types";
import { hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { ordinal } from "../../_shared/array";
import { BTree, isBST, randomBST, treeField, type Level } from "../../_shared/bintree";
import { TreeTrace } from "../../_shared/treetrace";
import { tn, type TreeState } from "../../_shared/tree";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  root: Level;
  k: number;
}

function* generate({ root, k }: Input) {
  const tree = BTree.fromLevel(root);
  const tt = new TreeTrace(tree, `k-th smallest, k = ${k}`);
  const stack: number[] = [];
  let node: number | null = tree.root;
  let left = k;
  let rank = 0;
  const v = (id: number | null) => tree.val(id);
  const step = (line: string, msg: string, extra = [] as ReturnType<typeof hl>, result?: number) => {
    const s = tt.step(line, msg, [...hl("frontier", ...stack.map(tn)), ...extra], { k: left, node: v(node) }, result, [{ name: "node", node }]);
    return { ...s, aux: [{ label: "stack", kind: "stack" as const, items: stack.map((id) => v(id)) }] };
  };

  yield step("init", `Inorder visits BST values smallest first. Find the ${ordinal(k)} one.`);
  for (;;) {
    while (node !== null) {
      stack.push(node);
      tt.t.count("pushes");
      const n: number = node;
      node = tree.get(n).left;
      yield step("push", `Push ${v(n)}; anything smaller is in its left subtree → move left to ${v(node)}.`, hl("active", tn(n)));
    }
    const id = stack.pop()!;
    tt.t.count("pops");
    node = id;
    left -= 1;
    rank += 1;
    tt.sub.set(id, `#${rank}`);
    tt.mark.set(id, "sorted");
    yield step("pop", `Pop ${v(id)}: it is the ${ordinal(rank)} smallest value. k is now ${left}.`, hl("current", tn(id)));
    tt.t.count("comparisons");
    if (left === 0) {
      yield step("check", `k reached 0.`, hl("found", tn(id)));
      yield step("found", `Return ${v(id)} — the ${ordinal(k)} smallest. The rest of the tree is never visited.`, hl("found", tn(id)), tree.get(id).val);
      return;
    }
    yield step("check", `k = ${left} > 0: keep going.`, hl("current", tn(id)));
    node = tree.get(id).right;
    yield step("right", node === null ? `${v(id)} has no right subtree; the next value is on the stack.` : `Next larger values are in ${v(id)}'s right subtree (${v(node)}).`);
  }
}

const algorithm: AlgorithmModule<Input, TreeState> = {
  ...meta,
  renderer: "tree",
  inputSchema: {
    fields: [treeField("root", "BST", { maxNodes: 14 }), { key: "k", label: "k", kind: "number", integer: true, min: 1, max: 14 }],
    validate: ({ root, k }) => {
      if (!isBST(root)) return "The tree must be a binary search tree with distinct values.";
      const n = root.filter((x) => x !== null).length;
      return k > n ? `k must be at most the number of nodes (${n}).` : null;
    },
  },
  presets: [
    { name: "LeetCode example: k = 3", input: { root: [5, 3, 6, 2, 4, null, null, 1], k: 3 } },
    { name: "k = 1 (the minimum)", input: { root: [8, 4, 12, 2, 6, 10, 14], k: 1 } },
    { name: "k = n (the maximum, visits everything)", input: { root: [8, 4, 12, 2, 6, 10, 14], k: 7 } },
    { name: "Edge case: single node", input: { root: [3], k: 1 } },
  ],
  randomInput: (size, rng = Math.random) => {
    const root = randomBST(rng, size, 1, 30, 12);
    return { root, k: randInt(rng, 1, root.filter((x) => x !== null).length) };
  },
  code: { python, javascript },
  generate,
  reference: ({ root, k }) => root.filter((x): x is number => x !== null).sort((a, b) => a - b)[k - 1],
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "Popped", frontier: "On the stack", active: "Just pushed", sorted: "Already counted", found: "The answer" },
};

export default algorithm;
