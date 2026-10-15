import type { AlgorithmModule, Step } from "../../../engine/types";
import { hl } from "../../../engine/trace";
import { shuffle } from "../../../engine/random";
import { BTree } from "../../_shared/bintree";
import { TreeTrace } from "../../_shared/treetrace";
import { te, tn, type TreeState } from "../../_shared/tree";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  keys: number[];
}

function* generate({ keys }: Input) {
  const tree = new BTree();
  const tt = new TreeTrace(tree, "AVL tree (h = height, b = balance)");
  const ht = new Map<number, number>();
  const H = (id: number | null) => (id === null ? 0 : ht.get(id)!);
  const bal = (id: number) => H(tree.get(id).left) - H(tree.get(id).right);
  const label = (id: number) => tt.sub.set(id, `h${H(id)} b${bal(id) > 0 ? "+" : ""}${bal(id)}`);
  const fix = (id: number) => {
    const n = tree.get(id);
    ht.set(id, 1 + Math.max(H(n.left), H(n.right)));
  };
  const relabel = () => {
    for (const id of tree.nodes.keys()) if (ht.has(id)) label(id);
  };
  let current = 0;

  function rotateRight(y: number): number {
    const x = tree.get(y).left!;
    tree.get(y).left = tree.get(x).right;
    tree.get(x).right = y;
    fix(y);
    fix(x);
    tt.t.count("swaps");
    return x;
  }
  function rotateLeft(x: number): number {
    const y = tree.get(x).right!;
    tree.get(x).right = tree.get(y).left;
    tree.get(y).left = x;
    fix(x);
    fix(y);
    tt.t.count("swaps");
    return y;
  }

  /** Re-link a returned subtree root under its parent (or as the tree root). */
  const link = (parent: number | null, side: "left" | "right" | null, child: number) => {
    if (parent === null) tree.root = child;
    else tree.get(parent)[side!] = child;
  };

  function* insert(id: number | null, key: number, parent: number | null, side: "left" | "right" | null): Generator<Step<TreeState>, number, unknown> {
    if (id === null) {
      const leaf = tree.add(key);
      ht.set(leaf, 1);
      link(parent, side, leaf);
      label(leaf);
      tt.t.count("writes");
      yield tt.step("new-leaf", `Empty spot: ${key} becomes a new leaf (height 1).`, hl("found", tn(leaf)), { key });
      return leaf;
    }
    const n = tree.get(id);
    tt.enter(id, `insert(${n.val}, ${key})`);
    tt.t.count("comparisons");
    const goLeft = key < n.val;
    yield tt.step(goLeft ? "go-left" : "go-right", `${key} ${goLeft ? "<" : ">"} ${n.val}: insert into the ${goLeft ? "left" : "right"} subtree.`, [], { key });
    yield* insert(goLeft ? n.left : n.right, key, id, goLeft ? "left" : "right");
    fix(id);
    label(id);
    yield tt.step("update", `Back at ${n.val}: height = 1 + max(${H(n.left)}, ${H(n.right)}) = ${H(id)}.`, [], { key, height: H(id) });
    const b = bal(id);
    tt.t.count("comparisons");
    yield tt.step("balance", `Balance factor of ${n.val} = ${H(n.left)} − ${H(n.right)} = ${b}${Math.abs(b) > 1 ? " — out of range!" : " — fine."}`, hl(Math.abs(b) > 1 ? "mismatch" : "match", tn(id)), { key, balance: b });
    let out = id;
    if (b > 1 && key < tree.get(n.left!).val) {
      const x = n.left!;
      yield tt.step("ll", `Left-left case (${key} went into ${tree.val(x)}'s left side): one right rotation at ${n.val}.`, [...hl("pivot", tn(id), tn(x)), ...hl("pivot", te(id, x))], { key, balance: b });
      out = rotateRight(id);
      link(parent, side, out);
      relabel();
      yield tt.step("rot-right", `Rotated right: ${tree.val(out)} is now this subtree's root, ${n.val} its right child.`, hl("swap", tn(out), tn(id)), { key });
    } else if (b < -1 && key > tree.get(n.right!).val) {
      const y = n.right!;
      yield tt.step("rr", `Right-right case (${key} went into ${tree.val(y)}'s right side): one left rotation at ${n.val}.`, [...hl("pivot", tn(id), tn(y)), ...hl("pivot", te(id, y))], { key, balance: b });
      out = rotateLeft(id);
      link(parent, side, out);
      relabel();
      yield tt.step("rot-left", `Rotated left: ${tree.val(out)} is now this subtree's root, ${n.val} its left child.`, hl("swap", tn(out), tn(id)), { key });
    } else if (b > 1) {
      const x = n.left!;
      yield tt.step("lr", `Left-right case (${key} went into ${tree.val(x)}'s right side): first rotate ${tree.val(x)} left...`, hl("pivot", tn(id), tn(x)), { key, balance: b });
      n.left = rotateLeft(x);
      relabel();
      yield tt.step("rot-left", `...now it is a left-left shape under ${n.val}...`, hl("swap", tn(n.left!), tn(x)), { key });
      out = rotateRight(id);
      link(parent, side, out);
      relabel();
      yield tt.step("rot-right", `...then rotate ${n.val} right: ${tree.val(out)} becomes this subtree's root.`, hl("swap", tn(out), tn(id)), { key });
    } else if (b < -1) {
      const y = n.right!;
      yield tt.step("rl", `Right-left case (${key} went into ${tree.val(y)}'s left side): first rotate ${tree.val(y)} right...`, hl("pivot", tn(id), tn(y)), { key, balance: b });
      n.right = rotateRight(y);
      relabel();
      yield tt.step("rot-right", `...now it is a right-right shape under ${n.val}...`, hl("swap", tn(n.right!), tn(y)), { key });
      out = rotateLeft(id);
      link(parent, side, out);
      relabel();
      yield tt.step("rot-left", `...then rotate ${n.val} left: ${tree.val(out)} becomes this subtree's root.`, hl("swap", tn(out), tn(id)), { key });
    } else {
      yield tt.step("ok", `${n.val} is balanced; return it unchanged.`, [], { key });
    }
    tt.leave();
    return out;
  }

  for (const key of keys) {
    current++;
    yield tt.step("call", `Insert ${key} (${current} of ${keys.length}), starting at the root.`, [], { key });
    yield* insert(tree.root, key, null, null);
    relabel();
  }
  yield tt.step("ok", `All keys inserted. Height ${H(tree.root)} for ${keys.length} key${keys.length === 1 ? "" : "s"}${keys.length > 2 ? " — every balance factor is in {−1, 0, +1}" : ""}.`, [], {}, tree.toLevel());
}

/** Independent AVL on plain objects, used to check the trace. */
function reference({ keys }: Input) {
  type N = { k: number; l: N | null; r: N | null; h: number };
  const h = (n: N | null) => (n ? n.h : 0);
  const fix = (n: N) => (n.h = 1 + Math.max(h(n.l), h(n.r)));
  const rr = (y: N) => {
    const x = y.l!;
    y.l = x.r;
    x.r = y;
    fix(y);
    fix(x);
    return x;
  };
  const rl = (x: N) => {
    const y = x.r!;
    x.r = y.l;
    y.l = x;
    fix(x);
    fix(y);
    return y;
  };
  const ins = (n: N | null, k: number): N => {
    if (!n) return { k, l: null, r: null, h: 1 };
    if (k < n.k) n.l = ins(n.l, k);
    else n.r = ins(n.r, k);
    fix(n);
    const b = h(n.l) - h(n.r);
    if (b > 1) {
      if (k > n.l!.k) n.l = rl(n.l!);
      return rr(n);
    }
    if (b < -1) {
      if (k < n.r!.k) n.r = rr(n.r!);
      return rl(n);
    }
    return n;
  };
  let root: N | null = null;
  for (const k of keys) root = ins(root, k);
  const out: (number | null)[] = [];
  const q: (N | null)[] = [root];
  while (q.length) {
    const x = q.shift()!;
    out.push(x ? x.k : null);
    if (x) q.push(x.l, x.r);
  }
  while (out.length && out[out.length - 1] === null) out.pop();
  return out;
}

const algorithm: AlgorithmModule<Input, TreeState> = {
  ...meta,
  renderer: "tree",
  inputSchema: {
    fields: [{ key: "keys", label: "keys to insert (in order)", kind: "numbers", integer: true, min: -99, max: 99, minLength: 1, maxLength: 12 }],
    validate: ({ keys }) => (new Set(keys).size === keys.length ? null : "Keys must be distinct."),
  },
  presets: [
    { name: "Sorted input: a plain BST would be a chain", input: { keys: [1, 2, 3, 4, 5, 6, 7] } },
    { name: "All four cases (LL, RR, LR, RL)", input: { keys: [30, 20, 10, 40, 50, 25, 22, 60, 55] } },
    { name: "Left-right double rotation", input: { keys: [30, 10, 20] } },
    { name: "Edge case: single key", input: { keys: [42] } },
  ],
  randomInput: (size, rng = Math.random) => ({ keys: shuffle(rng, Array.from({ length: 30 }, (_, i) => i + 1)).slice(0, Math.max(1, Math.min(10, size))) }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "Current call", active: "On the call stack", match: "Balanced", mismatch: "Balance ±2", pivot: "Nodes to rotate", swap: "After rotation", found: "New leaf" },
};

export default algorithm;
