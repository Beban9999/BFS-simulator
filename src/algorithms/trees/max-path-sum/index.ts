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
  const tt = new TreeTrace(tree, "gain(node) = best downward arm");
  const gainOf = new Map<number, number>();
  let best = -Infinity;
  let bestPath: Highlight[] = [];
  const fmt = (x: number) => (x === -Infinity ? "-inf" : String(x));

  /** The downward arm that realises gain(id): follow the child with the larger positive gain. */
  const arm = (id: number | null): number[] => {
    const out: number[] = [];
    while (id !== null && (gainOf.get(id) ?? 0) > 0) {
      out.push(id);
      const n = tree.get(id);
      const l = n.left === null ? 0 : Math.max(gainOf.get(n.left) ?? 0, 0);
      const r = n.right === null ? 0 : Math.max(gainOf.get(n.right) ?? 0, 0);
      id = l === 0 && r === 0 ? null : l >= r ? n.left : n.right;
    }
    return out;
  };
  const pathHl = (at: number, useL: boolean, useR: boolean): Highlight[] => {
    const n = tree.get(at);
    const L = useL ? arm(n.left) : [];
    const R = useR ? arm(n.right) : [];
    const edges = [...L.map((id, k) => te(k === 0 ? at : L[k - 1], id)), ...R.map((id, k) => te(k === 0 ? at : R[k - 1], id))];
    return [...hl("path", ...[...L, at, ...R].map(tn)), ...hl("path", ...edges)];
  };

  function* gain(id: number | null): Generator<Step<TreeState>, number, unknown> {
    if (id === null) {
      tt.nullFrame("gain(None)");
      yield tt.step("base", "An empty subtree contributes 0.", [], { best: fmt(best) });
      tt.frames.pop();
      return 0;
    }
    const n = tree.get(id);
    tt.enter(id, `gain(${n.val})`);
    yield tt.step("call", `gain(${n.val}): the best downward path that starts at ${n.val}.`, [], { best: fmt(best) });
    const lRaw = yield* gain(n.left);
    const l = Math.max(lRaw, 0);
    yield tt.step("left", `Left arm of ${n.val}: gain = ${lRaw}${lRaw < 0 ? " < 0, so take 0 (don't use that arm)" : ""} → ${l}.`, n.left !== null ? hl(lRaw > 0 ? "frontier" : "pruned", tn(n.left)) : [], { left: l, best: fmt(best) });
    const rRaw = yield* gain(n.right);
    const r = Math.max(rRaw, 0);
    yield tt.step("right", `Right arm of ${n.val}: gain = ${rRaw}${rRaw < 0 ? " < 0, so take 0" : ""} → ${r}.`, n.right !== null ? hl(rRaw > 0 ? "frontier" : "pruned", tn(n.right)) : [], { left: l, right: r, best: fmt(best) });
    const through = n.val + l + r;
    tt.t.count("comparisons");
    const g = n.val + Math.max(l, r);
    gainOf.set(id, g);
    if (through > best) {
      best = through;
      bestPath = pathHl(id, l > 0, r > 0);
    }
    yield tt.step(
      "update",
      `Path bending at ${n.val}: ${n.val} + ${l} + ${r} = ${through}. ${through === best && bestPath.length ? "New best!" : `Best stays ${fmt(best)}.`}`,
      through === best ? bestPath : hl("compare", tn(id)),
      { left: l, right: r, through, best: fmt(best) },
    );
    tt.sub.set(id, `g=${g}`);
    tt.mark.set(id, "sorted");
    yield tt.step("combine", `Return gain ${n.val} + max(${l}, ${r}) = ${g} to the parent.`, hl("found", tn(id)), { gain: g, best: fmt(best) });
    tt.leave();
    return g;
  }

  yield* gain(tree.root);
  yield tt.step("done", `The maximum path sum is ${best}.`, bestPath, { best }, best);
}

const algorithm: AlgorithmModule<Input, TreeState> = {
  ...meta,
  renderer: "tree",
  inputSchema: { fields: [treeField("root", "tree", { maxNodes: 13 })], validate: ({ root }) => (root.length === 0 ? "The tree needs at least one node." : null) },
  presets: [
    { name: "LeetCode example: bends at 20", input: { root: [-10, 9, 20, null, null, 15, 7] } },
    { name: "Simple: 1, 2, 3", input: { root: [1, 2, 3] } },
    { name: "Edge case: all negative", input: { root: [-3, -2, -5] } },
    { name: "Negative arm is dropped", input: { root: [5, 4, 8, 11, null, 13, 4, 7, -20, null, null, null, 1] } },
  ],
  randomInput: (size, rng = Math.random) => ({ root: randomTree(rng, size, -9, 9, 11) }),
  code: { python, javascript },
  generate,
  reference: ({ root }) => {
    let best = -Infinity;
    const g = (n: PlainNode | null): number => {
      if (!n) return 0;
      const l = Math.max(g(n.left), 0);
      const r = Math.max(g(n.right), 0);
      best = Math.max(best, n.val + l + r);
      return n.val + Math.max(l, r);
    };
    g(plainTree(root));
    return best;
  },
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "Current call", active: "On the call stack", frontier: "Arm used", pruned: "Negative arm dropped", compare: "Bend checked", path: "Best path so far", sorted: "Gain known", found: "Just returned" },
};

export default algorithm;
