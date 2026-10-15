import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { hl } from "../../../engine/trace";
import { pick, randInt } from "../../../engine/random";
import { BTree, bstLevel, isBST, plainTree, randomBST, treeField, type Level } from "../../_shared/bintree";
import { TreeTrace } from "../../_shared/treetrace";
import { te, tn, type TreeState } from "../../_shared/tree";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  root: Level;
  op: "search" | "insert";
  value: number;
}

function* generate({ root, op, value }: Input) {
  const tree = BTree.fromLevel(root);
  const tt = new TreeTrace(tree, op === "search" ? `search for ${value}` : `insert ${value}`);
  const visited: number[] = [];
  const trail = (): Highlight[] => [...hl("visited", ...visited.map(tn)), ...hl("visited", ...visited.slice(1).map((id, k) => te(visited[k], id)))];
  const at = (node: number | null) => [{ name: "node", node }];

  if (op === "search") {
    let node = tree.root;
    yield tt.step("s-init", `Start at the root${node === null ? " — the tree is empty" : ` (${tree.val(node)})`}.`, [], { target: value }, undefined, at(node));
    while (node !== null) {
      const n = tree.get(node);
      visited.push(node);
      tt.t.count("comparisons");
      if (value === n.val) {
        yield tt.step("s-compare", `${value} == ${n.val}.`, [...trail(), ...hl("found", tn(node))], { target: value, node: n.val }, undefined, at(node));
        yield tt.step("s-found", `Found ${value} after ${visited.length} comparison${visited.length === 1 ? "" : "s"}.`, [...trail(), ...hl("found", tn(node))], { target: value }, true, at(node));
        return;
      }
      const goLeft = value < n.val;
      const skipped = goLeft ? n.right : n.left;
      yield tt.step(
        "s-compare",
        `${value} ${goLeft ? "<" : ">"} ${n.val}: it can only be in the ${goLeft ? "left" : "right"} subtree${skipped !== null ? ` — the whole ${goLeft ? "right" : "left"} side is skipped` : ""}.`,
        [...trail(), ...hl("compare", tn(node)), ...(skipped !== null ? hl("pruned", ...collect(tree, skipped).map(tn)) : [])],
        { target: value, node: n.val },
        undefined,
        at(node),
      );
      node = goLeft ? n.left : n.right;
      yield tt.step("s-move", node === null ? `There is no ${goLeft ? "left" : "right"} child.` : `Move ${goLeft ? "left" : "right"} to ${tree.val(node)}.`, trail(), { target: value }, undefined, at(node));
    }
    yield tt.step("s-missing", `Fell off the tree: ${value} is not in the BST.`, trail(), { target: value }, false, at(null));
    return;
  }

  if (tree.root === null) {
    tree.root = tree.add(value);
    yield tt.step("i-empty", `The tree is empty: ${value} becomes the root.`, hl("found", tn(tree.root)), { val: value }, tree.toLevel());
    return;
  }
  let node = tree.root;
  yield tt.step("i-init", `Walk down from the root (${tree.val(node)}) to find the empty spot where ${value} belongs.`, [], { val: value }, undefined, at(node));
  for (;;) {
    const n = tree.get(node);
    visited.push(node);
    tt.t.count("comparisons");
    const goLeft = value < n.val;
    yield tt.step("i-compare", `${value} ${goLeft ? "<" : "≥"} ${n.val}: go ${goLeft ? "left" : "right"}.`, [...trail(), ...hl("compare", tn(node))], { val: value, node: n.val }, undefined, at(node));
    const side = goLeft ? "left" : "right";
    if (n[side] === null) {
      const id = tree.add(value);
      n[side] = id;
      tt.t.count("writes");
      yield tt.step(
        goLeft ? "i-attach-left" : "i-attach-right",
        `${n.val} has no ${side} child: attach ${value} there as a new leaf. Nothing else moves.`,
        [...trail(), ...hl("found", tn(id)), ...hl("found", te(node, id))],
        { val: value },
        tree.toLevel(),
        at(id),
      );
      return;
    }
    node = n[side]!;
    yield tt.step(goLeft ? "i-left" : "i-right", `Move ${side} to ${tree.val(node)}.`, trail(), { val: value }, undefined, at(node));
  }
}

/** All node ids of a subtree (for the "skipped" highlight). */
function collect(tree: BTree, id: number | null): number[] {
  if (id === null) return [];
  const n = tree.get(id);
  return [id, ...collect(tree, n.left), ...collect(tree, n.right)];
}

const algorithm: AlgorithmModule<Input, TreeState> = {
  ...meta,
  renderer: "tree",
  inputSchema: {
    fields: [
      treeField("root", "BST", { maxNodes: 14, min: -99, max: 99 }),
      {
        key: "op",
        label: "operation",
        kind: "select",
        options: [
          { value: "search", label: "Search" },
          { value: "insert", label: "Insert" },
        ],
      },
      { key: "value", label: "value", kind: "number", integer: true, min: -99, max: 99 },
    ],
    validate: ({ root, op, value }) => {
      if (!isBST(root)) return "The tree must be a binary search tree with distinct values.";
      if (op === "insert" && root.includes(value)) return `${value} is already in the tree — pick a new value to insert.`;
      return null;
    },
  },
  presets: [
    { name: "Search: found", input: { root: [8, 4, 12, 2, 6, 10, 14, 1, 3, 5, 7], op: "search", value: 5 } },
    { name: "Search: missing", input: { root: [8, 4, 12, 2, 6, 10, 14], op: "search", value: 11 } },
    { name: "Insert a new leaf", input: { root: [8, 4, 12, 2, 6, 10, 14], op: "insert", value: 9 } },
    { name: "Worst case: sorted inserts made a chain", input: { root: bstLevel([1, 2, 3, 4, 5, 6]), op: "search", value: 6 } },
    { name: "Edge case: insert into an empty tree", input: { root: [], op: "insert", value: 5 } },
  ],
  randomInput: (size, rng = Math.random) => {
    const root = randomBST(rng, size, 1, 30, 12);
    const op = pick(rng, ["search", "insert"] as const);
    const present = root.filter((x): x is number => x !== null);
    let value = randInt(rng, 1, 30);
    if (op === "insert") while (present.includes(value)) value = randInt(rng, 1, 30);
    else if (rng() < 0.5 && present.length) value = pick(rng, present);
    return { root, op, value };
  },
  code: { python, javascript },
  generate,
  reference: ({ root, op, value }) => {
    if (op === "search") return root.includes(value);
    // Re-inserting the level-order values rebuilds the same shape; then add the new value.
    return bstLevel([...levelOrderValues(root), value]);
  },
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "Current node", visited: "Path walked", compare: "Compared", pruned: "Skipped subtree", found: "Found / inserted" },
};

/** Values in BFS order: inserting them in this order rebuilds the same BST. */
function levelOrderValues(root: Level): number[] {
  const out: number[] = [];
  const q = [plainTree(root)];
  while (q.length) {
    const n = q.shift();
    if (!n) continue;
    out.push(n.val);
    q.push(n.left, n.right);
  }
  return out;
}

export default algorithm;
