import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { hl } from "../../../engine/trace";
import { pick } from "../../../engine/random";
import { BTree, isBST, randomBST, treeField, type Level } from "../../_shared/bintree";
import { TreeTrace } from "../../_shared/treetrace";
import { tn, type TreeState } from "../../_shared/tree";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  root: Level;
  p: number;
}

function* generate({ root, p }: Input) {
  const tree = BTree.fromLevel(root);
  const tt = new TreeTrace(tree, `successor of ${p}`);
  let succ: number | null = null;
  let node: number | null = tree.root;
  const seen: number[] = [];
  const v = (id: number | null) => tree.val(id);
  const target = [...tree.nodes.values()].find((n) => n.val === p)?.id;
  const step = (line: string, msg: string, extra: Highlight[] = [], result?: number | null) =>
    tt.step(
      line,
      msg,
      [...hl("visited", ...seen.map(tn)), ...(target !== undefined ? hl("pivot", tn(target)) : []), ...(succ !== null ? hl("found", tn(succ)) : []), ...extra],
      { p, node: v(node), succ: v(succ) },
      result,
      [{ name: "node", node }, ...(succ !== null ? [{ name: "succ", node: succ }] : [])],
    );

  yield step("init", `Find the smallest value greater than ${p}. No candidate yet: succ = None.`);
  while (node !== null) {
    const n = tree.get(node);
    seen.push(node);
    tt.t.count("comparisons");
    if (p < n.val) {
      yield step("compare", `${p} < ${n.val}: ${n.val} is bigger than p, so it is a candidate.`, hl("compare", tn(node)));
      succ = node;
      node = n.left;
      yield step("candidate", `succ = ${n.val}. A smaller candidate could only be in its left subtree → go left to ${v(node)}.`);
    } else {
      yield step("compare", `${p} ${p === n.val ? "=" : ">"} ${n.val}: ${n.val} is not bigger than p.`, hl("compare", tn(node)));
      node = n.right;
      yield step("go-right", `${n.val} and its left subtree are too small → go right to ${v(node)}.`);
    }
  }
  yield step("done", succ === null ? `Fell off the tree with no candidate: ${p} has no successor. Return None.` : `Fell off the tree. The last candidate, ${v(succ)}, is the successor of ${p}.`, [], succ === null ? null : tree.get(succ).val);
}

const algorithm: AlgorithmModule<Input, TreeState> = {
  ...meta,
  renderer: "tree",
  inputSchema: {
    fields: [treeField("root", "BST", { maxNodes: 14 }), { key: "p", label: "p", kind: "number", integer: true, min: -99, max: 99 }],
    validate: ({ root }) => (isBST(root) ? null : "The tree must be a binary search tree with distinct values."),
  },
  presets: [
    { name: "Successor is an ancestor", input: { root: [20, 8, 22, 4, 12, null, null, null, null, 10, 14], p: 14 } },
    { name: "Successor is in the right subtree", input: { root: [20, 8, 22, 4, 12, null, null, null, null, 10, 14], p: 8 } },
    { name: "p is the maximum: no successor", input: { root: [5, 3, 6, 2, 4], p: 6 } },
    { name: "p is not in the tree (a ceiling query)", input: { root: [8, 4, 12, 2, 6, 10, 14], p: 7 } },
  ],
  randomInput: (size, rng = Math.random) => {
    const root = randomBST(rng, size, 1, 30, 12);
    return { root, p: pick(rng, root.filter((x): x is number => x !== null)) };
  },
  code: { python, javascript },
  generate,
  reference: ({ root, p }) => {
    const bigger = root.filter((x): x is number => x !== null && x > p);
    return bigger.length ? Math.min(...bigger) : null;
  },
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "Current node", visited: "Walked", compare: "Compared with p", pivot: "p", found: "Best candidate (succ)" },
};

export default algorithm;
