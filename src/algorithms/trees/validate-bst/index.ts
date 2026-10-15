import type { AlgorithmModule, Step } from "../../../engine/types";
import { hl } from "../../../engine/trace";
import { BTree, isBST, randomBST, randomTree, treeField, type Level } from "../../_shared/bintree";
import { TreeTrace } from "../../_shared/treetrace";
import { tn, type TreeState } from "../../_shared/tree";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  root: Level;
}

const f = (x: number) => (x === -Infinity ? "-∞" : x === Infinity ? "∞" : String(x));

function* generate({ root }: Input) {
  const tree = BTree.fromLevel(root);
  const tt = new TreeTrace(tree, "allowed range (low, high) per node");

  function* valid(id: number | null, low: number, high: number): Generator<Step<TreeState>, boolean, unknown> {
    if (id === null) {
      tt.nullFrame(`valid(None, ${f(low)}, ${f(high)})`);
      yield tt.step("base", "An empty subtree is a valid BST.", [], { low: f(low), high: f(high) });
      tt.frames.pop();
      return true;
    }
    const n = tree.get(id);
    tt.enter(id, `valid(${n.val}, ${f(low)}, ${f(high)})`);
    tt.sub.set(id, `(${f(low)},${f(high)})`);
    yield tt.step("call", `valid(${n.val}): its value must lie strictly between ${f(low)} and ${f(high)}.`, [], { low: f(low), high: f(high) });
    tt.t.count("comparisons", 2);
    if (!(low < n.val && n.val < high)) {
      tt.mark.set(id, "mismatch");
      yield tt.step(
        "check",
        `${n.val} is ${n.val <= low ? `not greater than ${f(low)}` : `not smaller than ${f(high)}`} — it sits on the wrong side of an ancestor.`,
        hl("mismatch", tn(id)),
        { low: f(low), high: f(high) },
      );
      yield tt.step("bad", "Return False — and every caller above returns False too.", hl("mismatch", tn(id)), { low: f(low), high: f(high) });
      tt.leave();
      return false;
    }
    yield tt.step("check", `${f(low)} < ${n.val} < ${f(high)}: fine.`, hl("match", tn(id)), { low: f(low), high: f(high) });
    yield tt.step("left", `Left subtree: values must also be below ${n.val} → range (${f(low)}, ${n.val}).`, n.left !== null ? hl("frontier", tn(n.left)) : [], { low: f(low), high: n.val });
    const okL = yield* valid(n.left, low, n.val);
    if (!okL) {
      tt.leave();
      return false;
    }
    yield tt.step("right", `Left side of ${n.val} is valid. Right subtree: values must be above ${n.val} → range (${n.val}, ${f(high)}).`, n.right !== null ? hl("frontier", tn(n.right)) : [], { low: n.val, high: f(high) });
    const okR = yield* valid(n.right, n.val, high);
    if (okR) tt.mark.set(id, "sorted");
    tt.leave();
    return okR;
  }

  const ok = yield* valid(tree.root, -Infinity, Infinity);
  yield tt.step("done", ok ? "Every node was inside its range: this is a valid BST." : "Some node broke its range: NOT a valid BST.", [], {}, ok);
}

const algorithm: AlgorithmModule<Input, TreeState> = {
  ...meta,
  renderer: "tree",
  inputSchema: { fields: [treeField("root", "tree", { maxNodes: 13 })] },
  presets: [
    { name: "Valid BST", input: { root: [8, 4, 12, 2, 6, 10, 14] } },
    { name: "LeetCode example: right child smaller than the root", input: { root: [5, 1, 4, null, null, 3, 6] } },
    { name: "Trap: grandchild on the wrong side", input: { root: [5, 3, 8, 1, 6] } },
    { name: "Duplicates are not allowed", input: { root: [2, 2, 2] } },
    { name: "Edge case: single node", input: { root: [1] } },
  ],
  randomInput: (size, rng = Math.random) => ({ root: rng() < 0.5 ? randomBST(rng, size, 1, 20, 11) : randomTree(rng, size, 1, 20, 11) }),
  code: { python, javascript },
  generate,
  reference: ({ root }) => isBST(root),
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "Current call", active: "On the call stack", frontier: "Checked next", match: "Inside its range", mismatch: "Outside its range", sorted: "Subtree valid" },
};

export default algorithm;
