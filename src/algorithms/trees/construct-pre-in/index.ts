import type { AlgorithmModule, Highlight, Step } from "../../../engine/types";
import { hl } from "../../../engine/trace";
import { ai, range, type Range } from "../../_shared/array";
import { BTree, distinctValues, plainTree, randomDistinctTree, treeField, type Level, type PlainNode } from "../../_shared/bintree";
import { TreeTrace } from "../../_shared/treetrace";
import { tn, type TreeState } from "../../_shared/tree";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  root: Level;
}

function traversals(level: Level): { pre: number[]; ino: number[] } {
  const pre: number[] = [];
  const ino: number[] = [];
  const go = (n: PlainNode | null) => {
    if (!n) return;
    pre.push(n.val);
    go(n.left);
    ino.push(n.val);
    go(n.right);
  };
  go(plainTree(level));
  return { pre, ino };
}

function* generate({ root }: Input) {
  const { pre, ino } = traversals(root);
  const built = new BTree();
  const tt = new TreeTrace(built, "tree being built");
  const index = new Map(ino.map((v, i) => [v, i]));
  let p = 0;
  const used = new Set<number>(); // inorder positions already placed

  const arr = (lo: number | null, hi: number | null, mid: number | null, extra: Range[] = []) => {
    tt.array = {
      rows: [
        { label: "preorder", values: pre.length ? pre : [""] },
        { label: "inorder", values: ino.length ? ino : [""] },
      ],
      pointers: [...(p < pre.length ? [{ name: "p", index: p, row: 0 }] : []), ...(mid !== null ? [{ name: "mid", index: mid, row: 1 }] : [])],
      ranges: [...(lo !== null && hi !== null && lo <= hi ? [{ from: lo, to: hi, row: 1, kind: "window" as const, label: `[${lo}..${hi}]` }] : []), ...extra],
    };
  };
  const done = (): Highlight[] => [...hl("sorted", ...range(p).map((k) => ai(k, 0))), ...hl("sorted", ...[...used].map((k) => ai(k, 1)))];

  function* build(lo: number, hi: number, parent: number | null, side: "left" | "right" | null): Generator<Step<TreeState>, number | null, unknown> {
    arr(lo, hi, null);
    if (lo > hi) {
      tt.nullFrame(`build(${lo}, ${hi})`);
      yield tt.step("base", `build(${lo}, ${hi}): the slice is empty — no ${side ?? ""} subtree here.`, done());
      tt.frames.pop();
      return null;
    }
    const val = pre[p];
    const id = built.add(val);
    if (parent === null) built.root = id;
    else built.get(parent)[side!] = id;
    tt.enter(id, `build(${lo}, ${hi})`, { root: val });
    yield tt.step("call", `build(${lo}, ${hi}): build the subtree made of inorder[${lo}..${hi}] = [${ino.slice(lo, hi + 1).join(", ")}].`, done());
    yield tt.step("root", `The next preorder value, ${val}, is this subtree's root.`, [...done(), ...hl("current", ai(p, 0)), ...hl("found", tn(id))]);
    p++;
    const mid = index.get(val)!;
    used.add(mid);
    arr(lo, hi, mid, [
      ...(mid > lo ? [{ from: lo, to: mid - 1, row: 1, kind: "active" as const, label: "left" }] : []),
      ...(mid < hi ? [{ from: mid + 1, to: hi, row: 1, kind: "sorted" as const, label: "right" }] : []),
    ]);
    yield tt.step(
      "split",
      `${val} sits at inorder position ${mid}: [${ino.slice(lo, mid).join(", ") || "nothing"}] goes left, [${ino.slice(mid + 1, hi + 1).join(", ") || "nothing"}] goes right.`,
      [...done(), ...hl("current", ai(mid, 1))],
      { lo, hi, mid },
    );
    yield tt.step("left", `Build ${val}'s left subtree from inorder[${lo}..${mid - 1}].`, done(), { lo, hi, mid });
    yield* build(lo, mid - 1, id, "left");
    arr(lo, hi, mid);
    yield tt.step("right", `Left of ${val} is done. Build its right subtree from inorder[${mid + 1}..${hi}].`, done(), { lo, hi, mid });
    yield* build(mid + 1, hi, id, "right");
    arr(lo, hi, mid);
    tt.mark.set(id, "sorted");
    yield tt.step("return", `Return ${val} with both subtrees attached.`, done(), { lo, hi, mid });
    tt.leave();
    return id;
  }

  arr(null, null, null);
  yield tt.step("init", `preorder = [${pre.join(", ")}], inorder = [${ino.join(", ")}]. Map every value to its inorder position.`);
  yield* build(0, ino.length - 1, null, null);
  arr(null, null, null);
  yield tt.step("done", `Rebuilt tree: ${JSON.stringify(built.toLevel())}.`, done(), {}, built.toLevel());
}

const algorithm: AlgorithmModule<Input, TreeState> = {
  ...meta,
  renderer: "tree",
  inputSchema: {
    fields: [treeField("root", "tree to encode", { maxNodes: 12, help: "The page derives preorder and inorder from this tree, then rebuilds it from those two lists." })],
    validate: ({ root }) => (distinctValues(root) ? null : "Values must be distinct (otherwise inorder positions are ambiguous)."),
  },
  presets: [
    { name: "LeetCode example", input: { root: [3, 9, 20, null, null, 15, 7] } },
    { name: "Full tree", input: { root: [1, 2, 3, 4, 5, 6, 7] } },
    { name: "Edge case: left chain (every right slice is empty)", input: { root: [4, 3, null, 2, null, 1] } },
    { name: "Edge case: single node", input: { root: [-1] } },
  ],
  randomInput: (size, rng = Math.random) => ({ root: randomDistinctTree(rng, size, 1, 30, 10) }),
  code: { python, javascript },
  generate,
  reference: ({ root }) => {
    const t = BTree.fromLevel(root);
    return t.toLevel();
  },
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "Root / its position", window: "Current inorder slice", active: "Left part / on the stack", sorted: "Used", found: "New node" },
};

export default algorithm;
