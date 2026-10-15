import type { AlgorithmModule, Highlight, Step } from "../../../engine/types";
import { hl } from "../../../engine/trace";
import { pick, shuffle } from "../../../engine/random";
import { BTree, isBST, plainTree, randomBST, randomTree, treeField, type Level, type PlainNode } from "../../_shared/bintree";
import { TreeTrace } from "../../_shared/treetrace";
import { tn, type TreeState } from "../../_shared/tree";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  root: Level;
  mode: "bst" | "bt";
  p: number;
  q: number;
}

function* generate({ root, mode, p, q }: Input) {
  const tree = BTree.fromLevel(root);
  const tt = new TreeTrace(tree, mode === "bst" ? `LCA in a BST: p = ${p}, q = ${q}` : `LCA in a binary tree: p = ${p}, q = ${q}`);
  const v = (id: number | null) => tree.val(id);
  const idOf = (x: number) => [...tree.nodes.values()].find((n) => n.val === x)!.id;
  const pq: Highlight[] = hl("pivot", tn(idOf(p)), tn(idOf(q)));

  if (mode === "bst") {
    let node: number | null = tree.root;
    const walked: number[] = [];
    const step = (line: string, msg: string, extra: Highlight[] = [], result?: number) =>
      tt.step(line, msg, [...pq, ...hl("visited", ...walked.map(tn)), ...extra], { p, q, node: v(node) }, result, [{ name: "node", node }]);
    yield step("bst-init", `Start at the root ${v(node)}.`);
    while (node !== null) {
      const n = tree.get(node);
      walked.push(node);
      tt.t.count("comparisons", 2);
      if (p < n.val && q < n.val) {
        yield step("bst-compare", `${p} and ${q} are both < ${n.val}: both are in the left subtree.`, hl("compare", tn(node)));
        node = n.left;
        yield step("bst-left", `Go left to ${v(node)}.`);
      } else if (p > n.val && q > n.val) {
        yield step("bst-compare", `${p} and ${q} are both > ${n.val}: both are in the right subtree.`, hl("compare", tn(node)));
        node = n.right;
        yield step("bst-right", `Go right to ${v(node)}.`);
      } else {
        const why = p === n.val || q === n.val ? `${n.val} is one of them, and the other is below it` : `${Math.min(p, q)} < ${n.val} < ${Math.max(p, q)}: they split here`;
        yield step("bst-compare", `${why}.`, hl("found", tn(node)));
        yield step("bst-found", `The lowest common ancestor is ${n.val}.`, hl("found", tn(node)), n.val);
        return;
      }
    }
    return;
  }

  function* lca(id: number | null): Generator<Step<TreeState>, number | null, unknown> {
    if (id === null) {
      tt.nullFrame("lca(None)");
      yield tt.step("bt-base", "None: nothing found here.", pq);
      tt.frames.pop();
      return null;
    }
    const n = tree.get(id);
    tt.enter(id, `lca(${n.val})`);
    tt.t.count("comparisons");
    if (n.val === p || n.val === q) {
      tt.sub.set(id, "→ itself");
      tt.mark.set(id, "found");
      yield tt.step("bt-base", `${n.val} is ${n.val === p ? "p" : "q"} itself: return it. (If the other one is below it, ${n.val} is the answer — no need to look.)`, [...pq, ...hl("found", tn(id))]);
      tt.leave();
      return id;
    }
    yield tt.step("bt-base", `${n.val} is neither p nor q. Ask its subtrees.`, pq);
    yield tt.step("bt-left", `Search ${n.val}'s left subtree.`, [...pq, ...(n.left !== null ? hl("frontier", tn(n.left)) : [])]);
    const l = yield* lca(n.left);
    yield tt.step("bt-right", `Left of ${n.val} returned ${v(l)}. Now search the right subtree.`, [...pq, ...(n.right !== null ? hl("frontier", tn(n.right)) : [])], { left: v(l) });
    const r = yield* lca(n.right);
    if (l !== null && r !== null) {
      tt.sub.set(id, "LCA");
      tt.mark.set(id, "found");
      yield tt.step("bt-split", `Both sides found something (${v(l)} and ${v(r)}): p and q are split across ${n.val}, so ${n.val} is their LCA.`, [...pq, ...hl("found", tn(id))], { left: v(l), right: v(r) });
      tt.leave();
      return id;
    }
    const up = l ?? r;
    tt.sub.set(id, `→ ${v(up)}`);
    yield tt.step("bt-up", up === null ? `Neither side found p or q: return None.` : `Only one side found something: pass ${v(up)} up.`, pq, { left: v(l), right: v(r) });
    tt.leave();
    return up;
  }

  const ans = yield* lca(tree.root);
  yield tt.step("bt-up", `The lowest common ancestor of ${p} and ${q} is ${v(ans)}.`, [...pq, ...(ans !== null ? hl("found", tn(ans)) : [])], {}, ans === null ? null : tree.get(ans).val);
}

function reference({ root, p, q }: Input): number | null {
  // Root-to-node paths of p and q (by value); the last shared node is the LCA in either mode.
  const pathTo = (n: PlainNode | null, x: number): number[] | null => {
    if (!n) return null;
    if (n.val === x) return [n.val];
    const sub = pathTo(n.left, x) ?? pathTo(n.right, x);
    return sub ? [n.val, ...sub] : null;
  };
  const t = plainTree(root);
  const a = pathTo(t, p)!;
  const b = pathTo(t, q)!;
  let k = 0;
  while (k < a.length && k < b.length && a[k] === b[k]) k++;
  return a[k - 1];
}

const algorithm: AlgorithmModule<Input, TreeState> = {
  ...meta,
  renderer: "tree",
  inputSchema: {
    fields: [
      treeField("root", "tree", { maxNodes: 14 }),
      {
        key: "mode",
        label: "tree type",
        kind: "select",
        options: [
          { value: "bst", label: "BST (walk down)" },
          { value: "bt", label: "Any binary tree (recursion)" },
        ],
      },
      { key: "p", label: "p", kind: "number", integer: true, min: -99, max: 99 },
      { key: "q", label: "q", kind: "number", integer: true, min: -99, max: 99 },
    ],
    validate: ({ root, mode, p, q }) => {
      const vals = root.filter((x): x is number => x !== null);
      if (new Set(vals).size !== vals.length) return "Node values must be distinct.";
      if (!vals.includes(p) || !vals.includes(q)) return "p and q must both be values in the tree.";
      if (mode === "bst" && !isBST(root)) return "BST mode needs a binary search tree.";
      return null;
    },
  },
  presets: [
    { name: "BST: split point (LeetCode example)", input: { root: [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], mode: "bst", p: 2, q: 8 } },
    { name: "BST: one is the ancestor of the other", input: { root: [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], mode: "bst", p: 2, q: 5 } },
    { name: "Binary tree (LeetCode example)", input: { root: [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], mode: "bt", p: 5, q: 1 } },
    { name: "Binary tree: deep pair", input: { root: [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], mode: "bt", p: 7, q: 6 } },
    { name: "Edge case: p = q", input: { root: [3, 5, 1], mode: "bt", p: 1, q: 1 } },
  ],
  randomInput: (size, rng = Math.random) => {
    const mode = pick(rng, ["bst", "bt"] as const);
    let root: Level;
    if (mode === "bst") root = randomBST(rng, Math.max(2, size), 1, 30, 12);
    else {
      // Distinct values for a random shape.
      const shape = randomTree(rng, Math.max(2, size), 0, 0, 12);
      const vals = shuffle(rng, Array.from({ length: 30 }, (_, i) => i + 1));
      let k = 0;
      root = shape.map((x) => (x === null ? null : vals[k++]));
    }
    const vals = root.filter((x): x is number => x !== null);
    return { root, mode, p: pick(rng, vals), q: pick(rng, vals) };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "Current call", active: "On the call stack", pivot: "p and q", visited: "Walked", compare: "Both on one side", frontier: "Searched next", found: "Found / LCA" },
};

export default algorithm;
