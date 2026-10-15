import type { NumbersField, Rng } from "../../engine/types";
import { randInt } from "../../engine/random";

export type NodeId = number;

export interface ListNodeView {
  id: NodeId;
  val: number | string;
  /** Small text above the node, e.g. "dummy" or "copy". */
  label?: string;
  /** Drawn dashed (sentinel / dummy nodes). */
  ghost?: boolean;
}

export interface ListPointer {
  name: string;
  /** null = the variable currently holds None / null. */
  node: NodeId | null;
}

export interface ListState {
  nodes: ListNodeView[];
  next: Record<NodeId, NodeId | null>;
  /** Present for doubly linked lists: drawn as a second arrow under each `next`. */
  prev?: Record<NodeId, NodeId | null>;
  /** Random pointers (copy-random-list), drawn dashed above the row. */
  random?: Record<NodeId, NodeId | null>;
  /** Layout: node ids per row, left → right; null leaves an empty column. Nodes not listed are not drawn. */
  rows: (NodeId | null)[][];
  rowLabels?: string[];
  /** Variable labels drawn under nodes (null pointers are listed under the drawing). */
  pointers?: ListPointer[];
  caption?: string;
  result?: unknown;
}

/** Highlight ids: node, next edge, prev edge, random edge. */
export const nid = (id: NodeId) => `n:${id}`;
export const eid = (from: NodeId, to: NodeId) => `e:${from}-${to}`;
export const pid = (from: NodeId, to: NodeId) => `p:${from}-${to}`;
export const rid = (from: NodeId, to: NodeId) => `r:${from}-${to}`;

/**
 * Mutable list model used inside generators. Mirrors what the Python/JS code does with
 * `node.next = ...`, and produces renderer snapshots with `state()`.
 */
export class ListModel {
  nodes: ListNodeView[] = [];
  next: Record<NodeId, NodeId | null> = {};
  prev?: Record<NodeId, NodeId | null>;
  random?: Record<NodeId, NodeId | null>;
  rows: (NodeId | null)[][];
  rowLabels?: string[];

  constructor(rowCount = 1, rowLabels?: string[]) {
    this.rows = Array.from({ length: rowCount }, () => []);
    this.rowLabels = rowLabels;
  }

  /** Create a node (not linked). Placed at the end of `row` unless row is null. */
  add(val: number | string, row: number | null = 0, extra: Partial<ListNodeView> = {}): NodeId {
    const id = this.nodes.length;
    this.nodes.push({ id, val, ...extra });
    this.next[id] = null;
    if (this.prev) this.prev[id] = null;
    if (this.random) this.random[id] = null;
    if (row !== null) this.rows[row].push(id);
    return id;
  }

  /** Build a singly linked chain from values on `row`; returns the head (null if empty). */
  chain(vals: (number | string)[], row = 0): NodeId | null {
    const ids = vals.map((v) => this.add(v, row));
    ids.forEach((id, i) => (this.next[id] = i + 1 < ids.length ? ids[i + 1] : null));
    if (this.prev) ids.forEach((id, i) => (this.prev![id] = i > 0 ? ids[i - 1] : null));
    return ids.length ? ids[0] : null;
  }

  val(id: NodeId): number | string {
    return this.nodes[id].val;
  }

  /** Values from `head` following next (stops after `limit` nodes, so cycles are safe). */
  values(head: NodeId | null, limit = 1000): (number | string)[] {
    const out: (number | string)[] = [];
    for (let c = head; c !== null && out.length < limit; c = this.next[c]) out.push(this.nodes[c].val);
    return out;
  }

  /** Ids from `head` following next (cycle-safe). */
  ids(head: NodeId | null): NodeId[] {
    const out: NodeId[] = [];
    const seen = new Set<NodeId>();
    for (let c = head; c !== null && !seen.has(c); c = this.next[c]) {
      seen.add(c);
      out.push(c);
    }
    return out;
  }

  /** Remove a node from the drawing (it stays in memory). */
  hide(id: NodeId): void {
    for (const r of this.rows) {
      const i = r.indexOf(id);
      if (i >= 0) r.splice(i, 1);
    }
  }

  /** Move a node to (row, col) — padding the row with gaps if needed. */
  place(id: NodeId, row: number, col?: number): void {
    for (const r of this.rows) {
      const i = r.indexOf(id);
      if (i >= 0) r[i] = null;
    }
    const r = this.rows[row];
    if (col === undefined) {
      while (r.length && r[r.length - 1] === null) r.pop();
      r.push(id);
    } else {
      while (r.length <= col) r.push(null);
      r[col] = id;
    }
  }

  /** Re-lay a row as the chain starting at `head` (cycle-safe), starting at column `from`. */
  layout(row: number, head: NodeId | null, from = 0): void {
    const ids = this.ids(head);
    for (const id of ids) this.hide(id);
    this.rows[row] = [...Array(from).fill(null), ...ids];
  }

  state(extra: Partial<ListState> = {}): ListState {
    return {
      nodes: this.nodes,
      next: this.next,
      prev: this.prev,
      random: this.random,
      rows: this.rows.map((r) => {
        const out = r.slice();
        while (out.length && out[out.length - 1] === null) out.pop();
        return out;
      }),
      rowLabels: this.rowLabels,
      ...extra,
    };
  }
}

/** Field for a list of node values. */
export function listField(key = "head", label = "list", opts: Partial<NumbersField> = {}): NumbersField {
  return { key, label, kind: "numbers", integer: true, min: -99, max: 99, minLength: 0, maxLength: 10, help: "Node values, head first.", ...opts };
}

export function randomList(rng: Rng, size: number, lo = 0, hi = 9, maxLen = 10, minLen = 0): number[] {
  const n = Math.max(minLen, Math.min(maxLen, size));
  return Array.from({ length: n }, () => randInt(rng, lo, hi));
}

/** Render a list of values as "1 → 2 → 3 → null". */
export function arrowList(vals: (number | string)[]): string {
  return vals.length ? `${vals.join(" → ")} → null` : "null (empty)";
}
