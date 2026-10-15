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
  const tt = new TreeTrace(tree, "good = nothing larger above it");
  const fmt = (x: number) => (x === -Infinity ? "-inf" : String(x));
  let total = 0;

  function* dfs(id: number | null, best: number): Generator<Step<TreeState>, number, unknown> {
    if (id === null) {
      tt.nullFrame(`dfs(None, ${fmt(best)})`);
      yield tt.step("base", "None: no nodes, return 0.", [], { best: fmt(best) });
      tt.frames.pop();
      return 0;
    }
    const n = tree.get(id);
    tt.enter(id, `dfs(${n.val}, best=${fmt(best)})`);
    yield tt.step("call", `dfs(${n.val}): the largest value above it on the path is ${fmt(best)}.`, [], { best: fmt(best) });
    tt.t.count("comparisons");
    const good = n.val >= best ? 1 : 0;
    total += good;
    tt.mark.set(id, good ? "found" : "pruned");
    yield tt.step(
      "check",
      good ? `${n.val} ≥ ${fmt(best)}: nothing above is bigger — ${n.val} is good.` : `${n.val} < ${fmt(best)}: a bigger value sits above it — not good.`,
      hl(good ? "found" : "mismatch", tn(id)),
      { best: fmt(best), good },
    );
    const nb = Math.max(best, n.val);
    yield tt.step("update", `Pass best = max(${fmt(best)}, ${n.val}) = ${nb} down to the children.`, [], { best: nb, good });
    yield tt.step("left", `Count good nodes in the left subtree with best = ${nb}.`, n.left !== null ? hl("frontier", tn(n.left)) : [], { best: nb, good });
    const l = yield* dfs(n.left, nb);
    yield tt.step("right", `Left subtree of ${n.val} has ${l} good node${l === 1 ? "" : "s"}. Now the right subtree.`, n.right !== null ? hl("frontier", tn(n.right)) : [], { best: nb, good, left: l });
    const r = yield* dfs(n.right, nb);
    const sum = good + l + r;
    tt.sub.set(id, `=${sum}`);
    yield tt.step("combine", `${n.val} returns ${good} + ${l} + ${r} = ${sum}.`, [], { good, left: l, right: r });
    tt.leave();
    return sum;
  }

  const ans = yield* dfs(tree.root, -Infinity);
  yield tt.step("done", tree.root === null ? "Empty tree: 0 good nodes." : `${ans} good node${ans === 1 ? "" : "s"} (green).`, [], { total }, ans);
}

const algorithm: AlgorithmModule<Input, TreeState> = {
  ...meta,
  renderer: "tree",
  inputSchema: { fields: [treeField("root", "tree", { maxNodes: 13 })] },
  presets: [
    { name: "LeetCode example", input: { root: [3, 1, 4, 3, null, 1, 5] } },
    { name: "Equal values count as good", input: { root: [3, 3, null, 4, 2] } },
    { name: "Edge case: single node", input: { root: [1] } },
    { name: "Decreasing chain: only the root", input: { root: [9, 8, null, 7, null, 6] } },
    { name: "Increasing chain: all good", input: { root: [1, null, 2, null, 3, null, 4] } },
  ],
  randomInput: (size, rng = Math.random) => ({ root: randomTree(rng, size, 0, 9, 11) }),
  code: { python, javascript },
  generate,
  reference: ({ root }) => {
    const go = (n: PlainNode | null, best: number): number => (n ? (n.val >= best ? 1 : 0) + go(n.left, Math.max(best, n.val)) + go(n.right, Math.max(best, n.val)) : 0);
    return go(plainTree(root), -Infinity);
  },
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "Current call", active: "On the call stack", frontier: "Explored next", found: "Good node", pruned: "Not good", mismatch: "Bigger value above" },
};

export default algorithm;
