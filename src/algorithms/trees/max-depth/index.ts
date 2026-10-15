import type { AlgorithmModule, Step } from "../../../engine/types";
import { hl } from "../../../engine/trace";
import { BTree, plainTree, randomTree, treeField, type Level, type PlainNode } from "../../_shared/bintree";
import { TreeTrace } from "../../_shared/treetrace";
import { tn, type TreeState } from "../../_shared/tree";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  root: Level;
}

function* generate({ root }: Input) {
  const tree = BTree.fromLevel(root);
  const tt = new TreeTrace(tree, "max_depth (numbers = depth returned)");

  function* depth(id: number | null, isRoot: boolean): Generator<Step<TreeState>, number, unknown> {
    if (id === null) {
      tt.nullFrame("max_depth(None)");
      yield tt.step("base", isRoot ? "The tree is empty: its depth is 0." : "An empty subtree: return 0.", [], {}, isRoot ? 0 : undefined);
      tt.frames.pop();
      return 0;
    }
    const n = tree.get(id);
    tt.enter(id, `max_depth(${n.val})`);
    yield tt.step("call", `max_depth(${n.val}): this subtree's depth depends on its two children.`);
    yield tt.step("left", `Ask the left child${n.left === null ? " (None)" : ` ${tree.val(n.left)}`} for its depth.`, n.left !== null ? hl("frontier", tn(n.left)) : []);
    const l = yield* depth(n.left, false);
    tt.frames[tt.frames.length - 1].locals = { left: l };
    yield tt.step("right", `The left side of ${n.val} has depth ${l}. Now ask the right child${n.right === null ? " (None)" : ` ${tree.val(n.right)}`}.`, n.right !== null ? hl("frontier", tn(n.right)) : [], { left: l });
    const r = yield* depth(n.right, false);
    const d = 1 + Math.max(l, r);
    tt.frames[tt.frames.length - 1].locals = { left: l, right: r };
    tt.sub.set(id, `d=${d}`);
    tt.mark.set(id, "sorted");
    tt.t.count("comparisons");
    yield tt.step(
      "combine",
      `${n.val}: left = ${l}, right = ${r}, so depth = 1 + max(${l}, ${r}) = ${d}.${isRoot ? ` That is the whole tree's depth.` : ""}`,
      hl("found", tn(id)),
      { left: l, right: r, depth: d },
      isRoot ? d : undefined,
    );
    tt.leave();
    return d;
  }
  yield* depth(tree.root, true);
}

const algorithm: AlgorithmModule<Input, TreeState> = {
  ...meta,
  renderer: "tree",
  inputSchema: { fields: [treeField("root", "tree", { maxNodes: 13 })] },
  presets: [
    { name: "LeetCode example", input: { root: [3, 9, 20, null, null, 15, 7] } },
    { name: "Edge case: empty tree", input: { root: [] } },
    { name: "Edge case: chain (depth = n)", input: { root: [1, 2, null, 3, null, 4, null, 5] } },
    { name: "Full tree", input: { root: [1, 2, 3, 4, 5, 6, 7] } },
  ],
  randomInput: (size, rng = Math.random) => ({ root: randomTree(rng, size, 0, 9, 11) }),
  code: { python, javascript },
  generate,
  reference: ({ root }) => {
    const d = (n: PlainNode | null): number => (n ? 1 + Math.max(d(n.left), d(n.right)) : 0);
    return d(plainTree(root));
  },
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "Current call", active: "Waiting on the call stack", frontier: "Asked next", sorted: "Depth known", found: "Just returned" },
};

export default algorithm;
