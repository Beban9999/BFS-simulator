import type { AlgorithmModule, Step } from "../../../engine/types";
import { hl } from "../../../engine/trace";
import { pick, randInt } from "../../../engine/random";
import { BTree, isBST, plainTree, randomBST, treeField, type Level } from "../../_shared/bintree";
import { TreeTrace } from "../../_shared/treetrace";
import { te, tn, type TreeState } from "../../_shared/tree";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  root: Level;
  key: number;
}

function* generate({ root, key }: Input) {
  const tree = BTree.fromLevel(root);
  const tt = new TreeTrace(tree, `delete ${key}`);
  const v = (id: number | null) => tree.val(id);

  function* del(id: number | null, k: number): Generator<Step<TreeState>, number | null, unknown> {
    if (id === null) {
      tt.nullFrame(`delete_node(None, ${k})`);
      yield tt.step("call", `Reached None: ${k} is not in this subtree. Return None.`, [], { key: k });
      tt.frames.pop();
      return null;
    }
    const n = tree.get(id);
    tt.enter(id, `delete_node(${n.val}, ${k})`);
    tt.t.count("comparisons");
    if (k !== n.val) {
      const side = k < n.val ? "left" : "right";
      yield tt.step(side === "left" ? "go-left" : "go-right", `${k} ${k < n.val ? "<" : ">"} ${n.val}: delete it from the ${side} subtree.`, n[side] !== null ? hl("frontier", tn(n[side]!)) : [], { key: k });
      const old = n[side];
      const got = yield* del(n[side], k);
      n[side] = got;
      tt.t.count("writes");
      yield tt.step(
        side === "left" ? "go-left" : "go-right",
        got === old ? `Back at ${n.val}: re-attach ${n.val}.${side} = ${v(got)} (unchanged).` : `Back at ${n.val}: re-attach ${n.val}.${side} = ${v(got)} — the ${side} subtree has a new root.`,
        got !== null ? [...hl("swap", te(id, got)), ...hl("swap", tn(got))] : [],
        { key: k },
      );
      yield tt.step("return", `Return ${n.val} (this subtree's root is unchanged).`, [], { key: k });
      tt.leave();
      return id;
    }
    yield tt.step("case-no-left", `Found ${k}. ${n.left === null ? "It has no left child" : "It has a left child"}.`, hl("removed", tn(id)), { key: k });
    if (n.left === null) {
      yield tt.step(
        "case-no-left",
        n.right === null ? `Case 1 — a leaf: return None, so its parent simply drops it.` : `Case 2 — only a right child: return it (${v(n.right)}); it slides up into ${k}'s place.`,
        [...hl("removed", tn(id)), ...(n.right !== null ? hl("found", tn(n.right)) : [])],
        { key: k },
      );
      tt.leave();
      return n.right;
    }
    if (n.right === null) {
      yield tt.step("case-no-right", `Case 2 — only a left child: return it (${v(n.left)}); it slides up into ${k}'s place.`, [...hl("removed", tn(id)), ...hl("found", tn(n.left))], { key: k });
      tt.leave();
      return n.left;
    }
    let succ = n.right;
    yield tt.step("case-two", `Case 3 — two children. Its replacement must be the inorder successor: go right once (${v(succ)})...`, [...hl("removed", tn(id)), ...hl("compare", tn(succ))], { key: k });
    while (tree.get(succ).left !== null) {
      succ = tree.get(succ).left!;
      tt.t.count("accesses");
      yield tt.step("find-succ", `...then left as far as possible: ${v(succ)}.`, [...hl("removed", tn(id)), ...hl("compare", tn(succ))], { key: k });
    }
    const sv = tree.get(succ).val;
    n.val = sv;
    tt.t.count("writes");
    yield tt.step("copy", `Copy the successor's value ${sv} into the node — everything left is still smaller, everything right still larger.`, [...hl("found", tn(id)), ...hl("removed", tn(succ))], { key: k, succ: sv });
    yield tt.step("delete-succ", `Now delete the old ${sv} from the right subtree; it has no left child, so that is case 1 or 2.`, hl("removed", tn(succ)), { key: k, succ: sv });
    n.right = yield* del(n.right, sv);
    tt.t.count("writes");
    yield tt.step("return", `Return ${n.val}, the node that now holds ${sv}.`, hl("found", tn(id)), { key: k });
    tt.leave();
    return id;
  }

  yield tt.step("call", tree.root === null ? "The tree is empty." : `Delete ${key}, starting at the root ${v(tree.root)}.`, [], { key });
  tree.root = yield* del(tree.root, key);
  yield tt.step("return", `Done. The tree is still a valid BST: ${JSON.stringify(tree.toLevel())}.`, [], { key }, tree.toLevel());
}

const algorithm: AlgorithmModule<Input, TreeState> = {
  ...meta,
  renderer: "tree",
  inputSchema: {
    fields: [treeField("root", "BST", { maxNodes: 14 }), { key: "key", label: "key to delete", kind: "number", integer: true, min: -99, max: 99 }],
    validate: ({ root }) => (isBST(root) ? null : "The tree must be a binary search tree with distinct values."),
  },
  presets: [
    { name: "Case 3: two children (LeetCode example)", input: { root: [5, 3, 6, 2, 4, null, 7], key: 3 } },
    { name: "Case 3 at the root, successor deeper", input: { root: [8, 4, 12, 2, 6, 10, 14, null, null, null, null, 9, 11], key: 8 } },
    { name: "Case 2: one child", input: { root: [5, 3, 6, 2, 4, null, 7], key: 6 } },
    { name: "Case 1: a leaf", input: { root: [5, 3, 6, 2, 4, null, 7], key: 4 } },
    { name: "Key not present", input: { root: [5, 3, 6, 2, 4, null, 7], key: 0 } },
  ],
  randomInput: (size, rng = Math.random) => {
    const root = randomBST(rng, size, 1, 30, 12);
    const vals = root.filter((x): x is number => x !== null);
    return { root, key: rng() < 0.85 ? pick(rng, vals) : randInt(rng, 1, 30) };
  },
  code: { python, javascript },
  generate,
  reference: ({ root, key }) => {
    // Rebuild without the key using the textbook recursion on plain nodes.
    type N = { val: number; left: N | null; right: N | null };
    const del = (n: N | null, k: number): N | null => {
      if (!n) return null;
      if (k < n.val) n.left = del(n.left, k);
      else if (k > n.val) n.right = del(n.right, k);
      else {
        if (!n.left) return n.right;
        if (!n.right) return n.left;
        let s = n.right;
        while (s.left) s = s.left;
        n.val = s.val;
        n.right = del(n.right, s.val);
      }
      return n;
    };
    const out = del(plainTree(root), key);
    const level: Level = [];
    const q: (N | null)[] = [out];
    while (q.length) {
      const x = q.shift()!;
      if (!x) {
        level.push(null);
        continue;
      }
      level.push(x.val);
      q.push(x.left, x.right);
    }
    while (level.length && level[level.length - 1] === null) level.pop();
    return level;
  },
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "Current call", active: "On the call stack", frontier: "Going there", removed: "Being deleted", compare: "Successor search", found: "Replacement", swap: "Re-attached" },
};

export default algorithm;
