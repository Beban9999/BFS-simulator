import type { AlgorithmModule, Frame, Highlight, Step } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { pick } from "../../../engine/random";
import { ai } from "../../_shared/array";
import { BTree, plainTree, randomTree, treeField, type Level, type PlainNode } from "../../_shared/bintree";
import { te, tn, type TreeState } from "../../_shared/tree";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

type Order = "pre" | "in" | "post";

interface Input {
  root: Level;
  order: Order;
}

const NAME: Record<Order, string> = { pre: "Preorder", in: "Inorder", post: "Postorder" };

function* generate({ root, order }: Input) {
  const t = new Tracer<TreeState>();
  const tree = BTree.fromLevel(root);
  const out: number[] = [];
  const rank = new Map<number, number>();
  const frames: Frame[] = [];
  const path: number[] = []; // ids of the calls currently on the stack

  const snap = (cur: number | null, extra: Highlight[] = [], result?: number[]) => ({
    state: {
      trees: [tree.view({ name: `${NAME[order]} traversal`, sub: (n) => (rank.has(n.id) ? `#${rank.get(n.id)}` : undefined), pointers: cur === null ? [] : [{ name: "node", node: cur }] })],
      array: { rows: [{ label: "out", values: out.length ? out.slice() : [""] }] },
      result,
    },
    vars: { node: cur === null ? "—" : tree.val(cur), out: `[${out.join(", ")}]` },
    callStack: frames.map((f) => ({ ...f })),
    highlights: [
      ...hl("sorted", ...[...rank.keys()].map(tn)),
      ...hl("active", ...path.map(tn)),
      ...path.slice(1).map((id, k) => ({ id: te(path[k], id), kind: "active" as const })),
      ...(cur !== null ? hl("current", tn(cur)) : []),
      ...extra,
    ],
  });
  const record = (id: number, line: string, why: string): Step<TreeState> => {
    out.push(tree.get(id).val);
    rank.set(id, out.length);
    t.count("writes");
    return t.step(line, `${why}: record ${tree.val(id)} → out = [${out.join(", ")}].`, snap(id, hl("found", ai(out.length - 1))));
  };

  function* dfs(id: number | null, from: string): Generator<Step<TreeState>, void, unknown> {
    t.count("calls");
    if (id === null) {
      frames.push({ call: "dfs(None)" });
      yield t.step("base", `${from} is None — an empty subtree. Return immediately.`, snap(path.length ? path[path.length - 1] : null));
      frames.pop();
      return;
    }
    const n = tree.get(id);
    frames.push({ call: `dfs(${n.val})` });
    path.push(id);
    yield t.step("call", `dfs(${n.val}): explore the subtree rooted at ${n.val}.`, snap(id));
    if (order === "pre") yield record(id, "visit-pre", "Preorder visits the node before its children");
    yield t.step("go-left", `Go into the left subtree of ${n.val}${n.left === null ? " (empty)" : ` (rooted at ${tree.val(n.left)})`}.`, snap(id, n.left !== null ? hl("frontier", tn(n.left)) : []));
    yield* dfs(n.left, `The left child of ${n.val}`);
    if (order === "in") yield record(id, "visit-in", `Back at ${n.val}, left subtree done. Inorder visits the node now, between its subtrees`);
    yield t.step("go-right", `Back at ${n.val}; now its right subtree${n.right === null ? " (empty)" : ` (rooted at ${tree.val(n.right)})`}.`, snap(id, n.right !== null ? hl("frontier", tn(n.right)) : []));
    yield* dfs(n.right, `The right child of ${n.val}`);
    if (order === "post") yield record(id, "visit-post", `Both subtrees of ${n.val} are done. Postorder visits the node last`);
    path.pop();
    frames.pop();
  }

  if (tree.root === null) {
    yield t.step("call", "The tree is empty.", snap(null));
  } else {
    yield* dfs(tree.root, "root");
  }
  yield t.step("done", `${NAME[order]}: [${out.join(", ")}].`, snap(null, [], out.slice()));
}

function reference({ root, order }: Input): number[] {
  const out: number[] = [];
  const go = (n: PlainNode | null) => {
    if (!n) return;
    if (order === "pre") out.push(n.val);
    go(n.left);
    if (order === "in") out.push(n.val);
    go(n.right);
    if (order === "post") out.push(n.val);
  };
  go(plainTree(root));
  return out;
}

const orderField = {
  key: "order",
  label: "order",
  kind: "select" as const,
  options: [
    { value: "pre", label: "Preorder (node, left, right)" },
    { value: "in", label: "Inorder (left, node, right)" },
    { value: "post", label: "Postorder (left, right, node)" },
  ],
};

const algorithm: AlgorithmModule<Input, TreeState> = {
  ...meta,
  renderer: "tree",
  inputSchema: { fields: [treeField("root", "tree", { maxNodes: 12 }), orderField] },
  presets: [
    { name: "Inorder of a BST (sorted)", input: { root: [4, 2, 6, 1, 3, 5, 7], order: "in" } },
    { name: "Preorder", input: { root: [1, 2, 3, 4, 5, null, 6], order: "pre" } },
    { name: "Postorder", input: { root: [1, 2, 3, 4, 5, null, 6], order: "post" } },
    { name: "Edge case: right-leaning chain (deepest stack)", input: { root: [1, null, 2, null, 3, null, 4], order: "in" } },
    { name: "Edge case: single node", input: { root: [7], order: "pre" } },
  ],
  randomInput: (size, rng = Math.random) => ({ root: randomTree(rng, size, 0, 9, 10), order: pick(rng, ["pre", "in", "post"] as const) }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "Current call", active: "On the call stack", frontier: "Going there next", sorted: "Recorded", found: "Just recorded" },
};

export default algorithm;
