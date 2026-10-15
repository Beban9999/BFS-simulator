import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { ai } from "../../_shared/array";
import { BTree, plainTree, randomTree, treeField, type Level, type PlainNode } from "../../_shared/bintree";
import { tl, tn, type TreeState } from "../../_shared/tree";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  root: Level;
}

function* generate({ root }: Input) {
  const t = new Tracer<TreeState>();
  const tree = BTree.fromLevel(root);
  const thread = new Map<number, number>(); // pred -> cur (pred.right while the thread exists)
  const out: number[] = [];
  const done = new Set<number>();
  let cur: number | null = tree.root;
  let pred: number | null = null;
  const v = (id: number | null) => tree.val(id);
  /** pred.right as the algorithm sees it: the real child, or the thread. */
  const right = (id: number) => tree.get(id).right ?? thread.get(id) ?? null;

  const snap = (extra: Highlight[] = [], result?: number[]) => ({
    state: {
      trees: [
        {
          ...tree.view({ name: "Morris inorder", pointers: [{ name: "cur", node: cur }, ...(pred !== null ? [{ name: "pred", node: pred }] : [])] }),
          links: [...thread].map(([from, to]) => ({ from, to })),
        },
      ],
      array: { rows: [{ label: "out", values: out.length ? out.slice() : [""] }] },
      caption: thread.size ? `${thread.size} thread${thread.size === 1 ? "" : "s"} in the tree (dashed)` : "no threads",
      result,
    },
    vars: { cur: v(cur), pred: v(pred), threads: thread.size },
    highlights: [...hl("sorted", ...[...done].map(tn)), ...(cur !== null ? hl("current", tn(cur)) : []), ...extra],
  });
  const visit = (id: number) => {
    out.push(tree.get(id).val);
    done.add(id);
    t.count("writes");
  };

  yield t.step("init", tree.root === null ? "Empty tree." : `cur = root (${v(cur)}). No stack — the tree itself will remember the way back.`, snap());
  while (cur !== null) {
    const n = tree.get(cur);
    if (n.left === null) {
      visit(cur);
      yield t.step("visit", `${v(cur)} has no left subtree: visit it → out = [${out.join(", ")}].`, snap(hl("found", ai(out.length - 1))));
      const nx = right(cur);
      const viaThread = tree.get(cur).right === null && nx !== null;
      cur = nx;
      yield t.step("go-right", nx === null ? "No right pointer: the traversal is over." : viaThread ? `Follow the thread back up to ${v(nx)}.` : `Move right to ${v(nx)}.`, snap());
      continue;
    }
    pred = n.left;
    yield t.step("find-pred", `${v(cur)} has a left subtree. Find its inorder predecessor: start at the left child ${v(pred)}.`, snap(hl("compare", tn(pred))));
    while (right(pred) !== null && right(pred) !== cur) {
      pred = right(pred)!;
      t.count("accesses");
      yield t.step("find-pred", `Keep going right: pred = ${v(pred)}.`, snap(hl("compare", tn(pred))));
    }
    if (right(pred) === null) {
      thread.set(pred, cur);
      t.count("writes");
      yield t.step("thread", `pred ${v(pred)}.right is None: first visit. Thread ${v(pred)} → ${v(cur)} so we can come back after the left subtree.`, snap([...hl("compare", tn(pred)), ...hl("swap", tl(pred, cur))]));
      cur = n.left;
      pred = null;
      yield t.step("go-left", `Go left to ${v(cur)}.`, snap());
    } else {
      thread.delete(pred);
      t.count("writes");
      yield t.step("unthread", `pred ${v(pred)}.right already points to ${v(cur)}: we are back from the left subtree. Remove the thread.`, snap(hl("compare", tn(pred))));
      visit(cur);
      pred = null;
      yield t.step("visit-after", `Visit ${v(cur)} → out = [${out.join(", ")}].`, snap(hl("found", ai(out.length - 1))));
      const nx = right(cur);
      const viaThread = tree.get(cur).right === null && nx !== null;
      cur = nx;
      yield t.step("leave", nx === null ? "No right pointer: the traversal is over." : viaThread ? `Follow the thread back up to ${v(nx)}.` : `Move to the right child ${v(nx)}.`, snap());
    }
  }
  yield t.step("done", `Inorder: [${out.join(", ")}]. Every thread was removed — the tree is back to its original shape.`, snap([], out.slice()));
}

function reference({ root }: Input): number[] {
  const out: number[] = [];
  const go = (n: PlainNode | null) => {
    if (!n) return;
    go(n.left);
    out.push(n.val);
    go(n.right);
  };
  go(plainTree(root));
  return out;
}

const algorithm: AlgorithmModule<Input, TreeState> = {
  ...meta,
  renderer: "tree",
  inputSchema: { fields: [treeField("root", "tree", { maxNodes: 12 })] },
  presets: [
    { name: "Balanced BST", input: { root: [4, 2, 6, 1, 3, 5, 7] } },
    { name: "Long left arm (many threads at once)", input: { root: [5, 4, 6, 3, null, null, null, 2, null, 1] } },
    { name: "Edge case: right chain (no threads needed)", input: { root: [1, null, 2, null, 3] } },
    { name: "Edge case: single node", input: { root: [9] } },
  ],
  randomInput: (size, rng = Math.random) => ({ root: randomTree(rng, size, 0, 9, 10) }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "cur", compare: "Predecessor search", swap: "Thread just added", sorted: "Visited", found: "Just visited" },
};

export default algorithm;
