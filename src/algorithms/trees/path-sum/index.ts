import type { AlgorithmModule, Step } from "../../../engine/types";
import { hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { BTree, plainTree, randomTree, treeField, type Level, type PlainNode } from "../../_shared/bintree";
import { TreeTrace } from "../../_shared/treetrace";
import { te, tn, type TreeState } from "../../_shared/tree";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  root: Level;
  target: number;
}

function* generate({ root, target }: Input) {
  const tree = BTree.fromLevel(root);
  const tt = new TreeTrace(tree, `root-to-leaf paths summing to ${target}`);
  const t = tt.t;
  const res: number[][] = [];
  const path: number[] = [];
  const pathIds: number[] = [];
  const aux = () => [
    { label: "path", kind: "stack" as const, items: path.slice() },
    { label: "found paths", kind: "list" as const, items: res.map((p) => p.join("→")) },
  ];
  const pathHl = () => [...hl("path", ...pathIds.map(tn)), ...hl("path", ...pathIds.slice(1).map((id, k) => te(pathIds[k], id)))];

  function* dfs(id: number | null, remaining: number): Generator<Step<TreeState>, void, unknown> {
    if (id === null) {
      tt.nullFrame(`dfs(None, ${remaining})`);
      yield { ...tt.step("base", "None: nothing here — this is not a leaf, just a missing child.", [], { remaining }), aux: aux() };
      tt.frames.pop();
      return;
    }
    const n = tree.get(id);
    tt.enter(id, `dfs(${n.val}, ${remaining})`);
    yield { ...tt.step("call", `dfs(${n.val}, remaining = ${remaining}).`, [], { remaining }), aux: aux() };
    path.push(n.val);
    pathIds.push(id);
    const rem = remaining - n.val;
    tt.sub.set(id, `rem ${rem}`);
    t.count("pushes");
    yield { ...tt.step("choose", `Add ${n.val} to the path [${path.join(", ")}]; remaining = ${remaining} − ${n.val} = ${rem}.`, pathHl(), { remaining: rem }), aux: aux() };
    const leaf = n.left === null && n.right === null;
    t.count("comparisons");
    if (leaf && rem === 0) {
      yield { ...tt.step("leaf", `${n.val} is a leaf and the remainder is 0 — this path sums to ${target}. (Its two None children return at once.)`, [...pathHl(), ...hl("found", tn(id))], { remaining: rem }), aux: aux() };
      res.push(path.slice());
      yield { ...tt.step("record", `Record a copy: [${path.join(", ")}].`, [...hl("found", ...pathIds.map(tn))], { remaining: rem }), aux: aux() };
    } else {
      yield {
        ...tt.step("leaf", leaf ? `${n.val} is a leaf (both children None, so the calls below return at once) but ${rem} is left — no match.` : `${n.val} is not a leaf — keep going down.`, leaf ? [...pathHl(), ...hl("mismatch", tn(id))] : pathHl(), { remaining: rem }),
        aux: aux(),
      };
    }
    if (!leaf) {
      yield { ...tt.step("left", `Explore ${n.val}'s left side with remaining ${rem}.`, [...pathHl(), ...(n.left !== null ? hl("frontier", tn(n.left)) : [])], { remaining: rem }), aux: aux() };
      yield* dfs(n.left, rem);
      yield { ...tt.step("right", `Back at ${n.val}; explore its right side with remaining ${rem}.`, [...pathHl(), ...(n.right !== null ? hl("frontier", tn(n.right)) : [])], { remaining: rem }), aux: aux() };
      yield* dfs(n.right, rem);
    }
    path.pop();
    pathIds.pop();
    t.count("pops");
    tt.mark.set(id, "visited");
    yield { ...tt.step("undo", `Done below ${n.val}: pop it from the path → [${path.join(", ")}].`, pathHl(), { remaining }), aux: aux() };
    tt.leave();
  }
  if (tree.root === null) {
    yield { ...tt.step("done", "Empty tree: no paths.", [], {}, []), aux: aux() };
    return;
  }
  yield* dfs(tree.root, target);
  yield { ...tt.step("done", res.length ? `Found ${res.length} path${res.length === 1 ? "" : "s"}: ${res.map((p) => `[${p.join(", ")}]`).join(", ")}.` : `No root-to-leaf path sums to ${target}.`, [], {}, res.map((p) => p.slice())), aux: aux() };
}

const algorithm: AlgorithmModule<Input, TreeState> = {
  ...meta,
  renderer: "tree",
  inputSchema: {
    fields: [treeField("root", "tree", { maxNodes: 13 }), { key: "target", label: "target", kind: "number", integer: true, min: -200, max: 200 }],
  },
  presets: [
    { name: "LeetCode example: two paths", input: { root: [5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1], target: 22 } },
    { name: "No path matches", input: { root: [1, 2, 3], target: 5 } },
    { name: "Negative values (no pruning possible)", input: { root: [1, -2, -3, 1, 3, -2, null, -1], target: -1 } },
    { name: "Edge case: single node", input: { root: [7], target: 7 } },
    { name: "Edge case: empty tree", input: { root: [], target: 0 } },
  ],
  randomInput: (size, rng = Math.random) => ({ root: randomTree(rng, size, -3, 6, 11), target: randInt(rng, 0, 12) }),
  code: { python, javascript },
  generate,
  reference: ({ root, target }) => {
    const res: number[][] = [];
    const go = (n: PlainNode | null, acc: number[]) => {
      if (!n) return;
      const p = [...acc, n.val];
      if (!n.left && !n.right && p.reduce((a, b) => a + b, 0) === target) res.push(p);
      go(n.left, p);
      go(n.right, p);
    };
    go(plainTree(root), []);
    return res;
  },
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "Current call", active: "On the call stack", path: "Current path", frontier: "Explored next", found: "Matching path", mismatch: "Leaf, wrong sum", visited: "Finished" },
};

export default algorithm;
