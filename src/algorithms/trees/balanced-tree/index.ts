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
  const tt = new TreeTrace(tree, "height(node), -1 = unbalanced");

  function* height(id: number | null): Generator<Step<TreeState>, number, unknown> {
    if (id === null) {
      tt.nullFrame("height(None)");
      yield tt.step("base", "An empty subtree is balanced with height 0.");
      tt.frames.pop();
      return 0;
    }
    const n = tree.get(id);
    tt.enter(id, `height(${n.val})`);
    yield tt.step("call", `height(${n.val}).`);
    yield tt.step("left", `Check ${n.val}'s left subtree first.`, n.left !== null ? hl("frontier", tn(n.left)) : []);
    const l = yield* height(n.left);
    if (l === -1) {
      tt.sub.set(id, "-1");
      tt.mark.set(id, "mismatch");
      yield tt.step("left-bad", `The left subtree of ${n.val} is unbalanced, so ${n.val} returns -1 at once — its right subtree is never even explored.`, hl("mismatch", tn(id)), { left: l });
      tt.leave();
      return -1;
    }
    yield tt.step("right", `Left height of ${n.val} is ${l}. Now its right subtree.`, n.right !== null ? hl("frontier", tn(n.right)) : [], { left: l });
    const r = yield* height(n.right);
    tt.t.count("comparisons");
    if (r === -1 || Math.abs(l - r) > 1) {
      yield tt.step(
        "check",
        r === -1 ? `The right subtree of ${n.val} is unbalanced.` : `At ${n.val}: |${l} − ${r}| = ${Math.abs(l - r)} > 1 — this node breaks the balance rule.`,
        hl("mismatch", tn(id)),
        { left: l, right: r },
      );
      tt.sub.set(id, "-1");
      tt.mark.set(id, "mismatch");
      yield tt.step("bad", `Return -1: ${n.val}'s subtree is unbalanced.`, hl("mismatch", tn(id)), { left: l, right: r });
      tt.leave();
      return -1;
    }
    yield tt.step("check", `At ${n.val}: |${l} − ${r}| = ${Math.abs(l - r)} ≤ 1 — fine here.`, hl("match", tn(id)), { left: l, right: r });
    const hgt = 1 + Math.max(l, r);
    tt.sub.set(id, `h=${hgt}`);
    tt.mark.set(id, "sorted");
    yield tt.step("combine", `Return height ${hgt}.`, hl("found", tn(id)), { left: l, right: r });
    tt.leave();
    return hgt;
  }

  const h = yield* height(tree.root);
  yield tt.step("done", h === -1 ? "height(root) is -1: the tree is NOT balanced. Return False." : `height(root) = ${h} (not -1): every node passed. Return True.`, [], {}, h !== -1);
}

const algorithm: AlgorithmModule<Input, TreeState> = {
  ...meta,
  renderer: "tree",
  inputSchema: { fields: [treeField("root", "tree", { maxNodes: 13 })] },
  presets: [
    { name: "LeetCode example: balanced", input: { root: [3, 9, 20, null, null, 15, 7] } },
    { name: "Unbalanced deep in the left", input: { root: [1, 2, 2, 3, 3, null, null, 4, 4] } },
    { name: "Root is fine, a subtree is not", input: { root: [1, 2, 3, 4, null, null, 5, 6, null, null, 7] } },
    { name: "Edge case: empty tree", input: { root: [] } },
    { name: "Edge case: chain of 3", input: { root: [1, null, 2, null, 3] } },
  ],
  randomInput: (size, rng = Math.random) => ({ root: randomTree(rng, size, 0, 9, 11) }),
  code: { python, javascript },
  generate,
  reference: ({ root }) => {
    const h = (n: PlainNode | null): number => (n ? 1 + Math.max(h(n.left), h(n.right)) : 0);
    const ok = (n: PlainNode | null): boolean => !n || (Math.abs(h(n.left) - h(n.right)) <= 1 && ok(n.left) && ok(n.right));
    return ok(plainTree(root));
  },
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "Current call", active: "On the call stack", frontier: "Checked next", match: "Balanced here", mismatch: "Unbalanced (-1)", sorted: "Height known", found: "Just returned" },
};

export default algorithm;
