import type { Rng, TreeField } from "../../engine/types";
import { randInt, shuffle } from "../../engine/random";
import type { TreeView } from "./tree";

export type Level = (number | null)[];

export interface BNode {
  id: number;
  val: number;
  left: number | null;
  right: number | null;
}

/**
 * Mutable binary tree for generators. Node ids are stable (insertion order), so the tree
 * renderer animates nodes when the shape changes (rotations, deletions).
 */
export class BTree {
  nodes = new Map<number, BNode>();
  root: number | null = null;
  private nextId = 0;

  add(val: number): number {
    const id = this.nextId++;
    this.nodes.set(id, { id, val, left: null, right: null });
    return id;
  }

  get(id: number): BNode {
    return this.nodes.get(id)!;
  }

  val(id: number | null): number | string {
    return id === null ? "null" : this.get(id).val;
  }

  /** Build from LeetCode level order: [3, 9, 20, null, null, 15, 7]. */
  static fromLevel(level: Level): BTree {
    const t = new BTree();
    if (!level.length || level[0] === null) return t;
    t.root = t.add(level[0]);
    const queue = [t.root];
    let i = 1;
    while (queue.length && i < level.length) {
      const cur = t.get(queue.shift()!);
      for (const side of ["left", "right"] as const) {
        if (i >= level.length) break;
        const v = level[i++];
        if (v !== null) {
          const id = t.add(v);
          cur[side] = id;
          queue.push(id);
        }
      }
    }
    return t;
  }

  /** Back to LeetCode level order (trailing nulls trimmed). */
  toLevel(): Level {
    const out: Level = [];
    const queue: (number | null)[] = [this.root];
    while (queue.length) {
      const id = queue.shift()!;
      if (id === null) {
        out.push(null);
        continue;
      }
      const n = this.get(id);
      out.push(n.val);
      queue.push(n.left, n.right);
    }
    while (out.length && out[out.length - 1] === null) out.pop();
    return out;
  }

  /** Ids in preorder / inorder (iterative, cycle-free trees only). */
  inorder(id: number | null = this.root): number[] {
    if (id === null) return [];
    const n = this.get(id);
    return [...this.inorder(n.left), id, ...this.inorder(n.right)];
  }

  size(id: number | null = this.root): number {
    return id === null ? 0 : 1 + this.size(this.get(id).left) + this.size(this.get(id).right);
  }

  height(id: number | null = this.root): number {
    return id === null ? 0 : 1 + Math.max(this.height(this.get(id).left), this.height(this.get(id).right));
  }

  /** Parent of a node (linear scan; trees here are small). */
  parent(id: number): number | null {
    for (const n of this.nodes.values()) if (n.left === id || n.right === id) return n.id;
    return null;
  }

  view(opts: { name?: string; pointers?: { name: string; node: number | null }[]; note?: string; label?: (n: BNode) => string; sub?: (n: BNode) => string | undefined } = {}): TreeView {
    const children: TreeView["children"] = {};
    const nodes: TreeView["nodes"] = [];
    const walk = (id: number | null) => {
      if (id === null) return;
      const n = this.get(id);
      nodes.push({ id, label: opts.label ? opts.label(n) : String(n.val), sub: opts.sub?.(n) });
      if (n.left !== null || n.right !== null) children[id] = [n.left, n.right];
      walk(n.left);
      walk(n.right);
    };
    walk(this.root);
    return { name: opts.name, root: this.root, nodes, children, pointers: opts.pointers, note: opts.note };
  }
}

/** Plain recursive helpers on level-order input, for `reference()` implementations. */
export interface PlainNode {
  val: number;
  left: PlainNode | null;
  right: PlainNode | null;
}

export function plainTree(level: Level): PlainNode | null {
  if (!level.length || level[0] === null) return null;
  const root: PlainNode = { val: level[0], left: null, right: null };
  const queue = [root];
  let i = 1;
  while (queue.length && i < level.length) {
    const cur = queue.shift()!;
    for (const side of ["left", "right"] as const) {
      if (i >= level.length) break;
      const v = level[i++];
      if (v !== null) {
        cur[side] = { val: v, left: null, right: null };
        queue.push(cur[side]!);
      }
    }
  }
  return root;
}

export function treeField(key = "root", label = "tree", opts: Partial<TreeField> = {}): TreeField {
  return { key, label, kind: "tree", maxNodes: 15, min: -99, max: 99, help: "Level order, null for a missing child: [3, 9, 20, null, null, 15, 7].", ...opts };
}

/** A random binary tree shape with `n` nodes, in level order. */
export function randomTree(rng: Rng, n: number, lo = 0, hi = 9, maxNodes = 12): Level {
  const count = Math.max(1, Math.min(maxNodes, n));
  const t = new BTree();
  t.root = t.add(randInt(rng, lo, hi));
  const ids = [t.root];
  while (ids.length < count) {
    const parent = t.get(ids[randInt(rng, 0, ids.length - 1)]);
    const side = rng() < 0.5 ? "left" : "right";
    if (parent[side] !== null) continue;
    const id = t.add(randInt(rng, lo, hi));
    parent[side] = id;
    ids.push(id);
  }
  return t.toLevel();
}

/** Insert values into a BST in the given order (duplicates ignored) and return level order. */
export function bstLevel(values: number[]): Level {
  const t = new BTree();
  for (const v of values) {
    if (t.root === null) {
      t.root = t.add(v);
      continue;
    }
    let cur = t.get(t.root);
    for (;;) {
      if (v === cur.val) break;
      const side = v < cur.val ? "left" : "right";
      if (cur[side] === null) {
        cur[side] = t.add(v);
        break;
      }
      cur = t.get(cur[side]!);
    }
  }
  return t.toLevel();
}

/** A random BST of distinct values. */
export function randomBST(rng: Rng, n: number, lo = 1, hi = 40, maxNodes = 12): Level {
  const pool = shuffle(rng, Array.from({ length: hi - lo + 1 }, (_, i) => lo + i));
  return bstLevel(pool.slice(0, Math.max(1, Math.min(maxNodes, n))));
}

/** True when the level-order tree is a valid BST with distinct values. */
export function isBST(level: Level): boolean {
  const ok = (n: PlainNode | null, lo: number, hi: number): boolean => !n || (n.val > lo && n.val < hi && ok(n.left, lo, n.val) && ok(n.right, n.val, hi));
  return ok(plainTree(level), -Infinity, Infinity);
}
