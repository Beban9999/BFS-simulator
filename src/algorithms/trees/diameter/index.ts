import type { AlgorithmModule, Highlight, Step } from "../../../engine/types";
import { hl } from "../../../engine/trace";
import { BTree, plainTree, randomTree, treeField, type Level, type PlainNode } from "../../_shared/bintree";
import { TreeTrace } from "../../_shared/treetrace";
import { te, tn, type TreeState } from "../../_shared/tree";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  root: Level;
}

function* generate({ root }: Input) {
  const tree = BTree.fromLevel(root);
  const tt = new TreeTrace(tree, "height(node) · best path bends somewhere");
  const h = new Map<number, number>();
  let best = 0;
  let bestAt: number | null = null;

  /** Nodes + edges of the longest path bending at `at` (follow the taller child down each side). */
  const pathAt = (at: number): Highlight[] => {
    const down = (id: number | null): number[] => {
      const out: number[] = [];
      while (id !== null) {
        out.push(id);
        const n = tree.get(id);
        id = (h.get(n.left!) ?? 0) >= (h.get(n.right!) ?? 0) ? n.left : n.right;
        if (id !== null && !h.has(id)) break;
      }
      return out;
    };
    const n = tree.get(at);
    const left = down(n.left);
    const right = down(n.right);
    const nodes = [...left, at, ...right];
    const edges = [
      ...left.map((id, k) => te(k === 0 ? at : left[k - 1], id)),
      ...right.map((id, k) => te(k === 0 ? at : right[k - 1], id)),
    ];
    return [...hl("path", ...nodes.map(tn)), ...hl("path", ...edges)];
  };

  function* height(id: number | null): Generator<Step<TreeState>, number, unknown> {
    if (id === null) {
      tt.nullFrame("height(None)");
      yield tt.step("base", "An empty subtree has height 0.", [], { best });
      tt.frames.pop();
      return 0;
    }
    const n = tree.get(id);
    tt.enter(id, `height(${n.val})`);
    yield tt.step("call", `height(${n.val}).`, [], { best });
    yield tt.step("left", `Height of ${n.val}'s left subtree first.`, n.left !== null ? hl("frontier", tn(n.left)) : [], { best });
    const l = yield* height(n.left);
    yield tt.step("right", `Left height of ${n.val} is ${l}; now the right subtree.`, n.right !== null ? hl("frontier", tn(n.right)) : [], { left: l, best });
    const r = yield* height(n.right);
    tt.t.count("comparisons");
    const through = l + r;
    if (through > best) {
      best = through;
      bestAt = id;
    }
    h.set(id, 1 + Math.max(l, r));
    tt.sub.set(id, `h=${1 + Math.max(l, r)}`);
    yield tt.step(
      "update",
      `A path bending at ${n.val} can use ${l} edge${l === 1 ? "" : "s"} on the left and ${r} on the right: ${through}. ${bestAt === id ? `New best!` : `Best stays ${best}.`}`,
      bestAt === id ? pathAt(id) : hl("compare", tn(id)),
      { left: l, right: r, "left+right": through, best },
    );
    tt.mark.set(id, "sorted");
    yield tt.step("combine", `Return height ${1 + Math.max(l, r)} to the parent — only the taller side (${Math.max(l, r)}) can continue upward.`, hl("found", tn(id)), { left: l, right: r, best });
    tt.leave();
    return 1 + Math.max(l, r);
  }

  if (tree.root === null) {
    yield tt.step("done", "Empty tree: the diameter is 0.", [], { best: 0 }, 0);
    return;
  }
  yield* height(tree.root);
  yield tt.step("done", best === 0 ? "Diameter = 0: a single node has no edges." : `Diameter = ${best} edge${best === 1 ? "" : "s"}, along the path bending at ${tree.val(bestAt)}.`, bestAt !== null && best > 0 ? pathAt(bestAt) : [], { best }, best);
}

const algorithm: AlgorithmModule<Input, TreeState> = {
  ...meta,
  renderer: "tree",
  inputSchema: { fields: [treeField("root", "tree", { maxNodes: 13 })] },
  presets: [
    { name: "LeetCode example", input: { root: [1, 2, 3, 4, 5] } },
    { name: "Longest path avoids the root", input: { root: [1, 2, null, 3, 4, 5, null, null, 6, 7, null, null, 8] } },
    { name: "Edge case: single node", input: { root: [1] } },
    { name: "Edge case: two nodes", input: { root: [1, 2] } },
    { name: "Full tree", input: { root: [1, 2, 3, 4, 5, 6, 7] } },
  ],
  randomInput: (size, rng = Math.random) => ({ root: randomTree(rng, size, 0, 9, 11) }),
  code: { python, javascript },
  generate,
  reference: ({ root }) => {
    let best = 0;
    const d = (n: PlainNode | null): number => {
      if (!n) return 0;
      const l = d(n.left);
      const r = d(n.right);
      best = Math.max(best, l + r);
      return 1 + Math.max(l, r);
    };
    d(plainTree(root));
    return best;
  },
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "Current call", active: "On the call stack", frontier: "Asked next", compare: "Bend checked", path: "Best path so far", sorted: "Height known", found: "Just returned" },
};

export default algorithm;
