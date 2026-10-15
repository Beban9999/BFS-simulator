import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { pick } from "../../../engine/random";
import { ai } from "../../_shared/array";
import { BTree, plainTree, randomTree, treeField, type Level, type PlainNode } from "../../_shared/bintree";
import { tn, type TreeState } from "../../_shared/tree";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

type Order = "pre" | "in" | "post";

interface Input {
  root: Level;
  order: Order;
}

function* generate({ root, order }: Input) {
  const t = new Tracer<TreeState>();
  const tree = BTree.fromLevel(root);
  const out: number[] = [];
  const done = new Set<number>();
  const stack: number[] = [];
  let cur: number | null = null;
  const v = (id: number | null) => tree.val(id);

  const snap = (extra: Highlight[] = [], hot?: number, result?: number[], note?: string) => ({
    state: {
      trees: [tree.view({ name: order === "post" ? "Postorder via reversed (node, right, left)" : order === "pre" ? "Iterative preorder" : "Iterative inorder", pointers: order === "in" ? [{ name: "cur", node: cur }] : [] })],
      array: { rows: [{ label: order === "post" ? "out (before reversing)" : "out", values: out.length ? out.slice() : [""] }] },
      caption: note,
      result,
    },
    vars: { ...(order === "in" ? { cur: v(cur) } : {}), stack: `[${stack.map((id) => v(id)).join(", ")}]` },
    aux: [{ label: "stack", kind: "stack" as const, items: stack.map((id) => v(id)), highlight: hot === undefined ? [] : [hot] }],
    highlights: [...hl("sorted", ...[...done].map(tn)), ...hl("frontier", ...stack.map(tn)), ...extra],
  });
  const record = (id: number) => {
    out.push(tree.get(id).val);
    done.add(id);
    t.count("writes");
  };

  if (order === "pre" || order === "post") {
    const p = order === "pre" ? "pre" : "post";
    if (tree.root !== null) stack.push(tree.root);
    yield t.step(`${p}-init`, tree.root === null ? "Empty tree: nothing to do." : `Start with the root ${v(tree.root)} on the stack.`, snap([], stack.length - 1));
    while (stack.length) {
      const id = stack.pop()!;
      t.count("pops");
      record(id);
      yield t.step(`${p}-pop`, `Pop ${v(id)} and record it: out = [${out.join(", ")}].`, snap([...hl("current", tn(id)), ...hl("found", ai(out.length - 1))]));
      const n = tree.get(id);
      const first = order === "pre" ? n.right : n.left;
      const second = order === "pre" ? n.left : n.right;
      const pushed: number[] = [];
      for (const c of [first, second]) {
        if (c !== null) {
          stack.push(c);
          pushed.push(c);
          t.count("pushes");
        }
      }
      yield t.step(
        `${p}-push`,
        pushed.length === 0
          ? `${v(id)} is a leaf: nothing to push.`
          : order === "pre"
            ? `Push ${pushed.map((c) => v(c)).join(" then ")} — the right child goes in first so the left child is popped first.`
            : `Push ${pushed.map((c) => v(c)).join(" then ")} — left first, so the right child is popped first (node, right, left).`,
        snap([...hl("current", tn(id)), ...hl("active", ...pushed.map(tn))], stack.length - 1),
      );
    }
    let result = out.slice();
    if (order === "post") {
      result = out.slice().reverse();
      out.splice(0, out.length, ...result);
      yield t.step("post-done", `The stack is empty. Reverse node-right-left to get postorder (left, right, node): [${result.join(", ")}].`, snap([], undefined, result, "out is now reversed: left, right, node"));
    } else {
      yield t.step("pre-done", `The stack is empty. Preorder: [${result.join(", ")}].`, snap([], undefined, result));
    }
    return;
  }

  cur = tree.root;
  yield t.step("in-init", tree.root === null ? "Empty tree: nothing to do." : `cur = root (${v(cur)}), empty stack.`, snap(cur !== null ? hl("current", tn(cur)) : []));
  while (cur !== null || stack.length) {
    while (cur !== null) {
      stack.push(cur);
      t.count("pushes");
      const n: number = cur;
      cur = tree.get(n).left;
      yield t.step("in-push", `Push ${v(n)} and step to its left child (${v(cur)}).`, snap([...hl("active", tn(n)), ...(cur !== null ? hl("current", tn(cur)) : [])], stack.length - 1));
    }
    const id = stack.pop()!;
    t.count("pops");
    record(id);
    cur = id;
    yield t.step("in-pop", `No more left children. Pop ${v(id)} — nothing smaller is left unvisited — and record it: out = [${out.join(", ")}].`, snap([...hl("current", tn(id)), ...hl("found", ai(out.length - 1))]));
    cur = tree.get(id).right;
    yield t.step("in-right", cur === null ? `${v(id)} has no right subtree.` : `Continue with ${v(id)}'s right subtree (${v(cur)}).`, snap(cur !== null ? hl("current", tn(cur)) : []));
  }
  yield t.step("in-done", `cur is None and the stack is empty. Inorder: [${out.join(", ")}].`, snap([], undefined, out.slice()));
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

const algorithm: AlgorithmModule<Input, TreeState> = {
  ...meta,
  renderer: "tree",
  inputSchema: {
    fields: [
      treeField("root", "tree", { maxNodes: 12 }),
      {
        key: "order",
        label: "order",
        kind: "select",
        options: [
          { value: "pre", label: "Preorder (one stack)" },
          { value: "in", label: "Inorder (left spine)" },
          { value: "post", label: "Postorder (reversed preorder)" },
        ],
      },
    ],
  },
  presets: [
    { name: "Inorder on a BST", input: { root: [5, 3, 8, 1, 4, 7, 9], order: "in" } },
    { name: "Preorder", input: { root: [1, 2, 3, 4, 5, null, 6], order: "pre" } },
    { name: "Postorder", input: { root: [1, 2, 3, 4, 5, null, 6], order: "post" } },
    { name: "Edge case: left chain (stack holds everything)", input: { root: [4, 3, null, 2, null, 1], order: "in" } },
    { name: "Edge case: single node", input: { root: [7], order: "post" } },
  ],
  randomInput: (size, rng = Math.random) => ({ root: randomTree(rng, size, 0, 9, 10), order: pick(rng, ["pre", "in", "post"] as const) }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "Current node", frontier: "On the stack", active: "Just pushed", sorted: "Recorded", found: "Just recorded" },
};

export default algorithm;
