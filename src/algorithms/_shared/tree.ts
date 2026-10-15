import type { ArrayState } from "./array";

export type TreeId = number;

export interface TreeNodeView {
  id: TreeId;
  label: string;
  /** Small text under the label, e.g. the array index of a heap node. */
  sub?: string;
}

export interface TreeView {
  name?: string;
  root: TreeId | null;
  nodes: TreeNodeView[];
  /** Children per node. Binary trees use [left, right] with null for a missing side (keeps positions). */
  children: Record<TreeId, (TreeId | null)[]>;
  /** Variable labels drawn under nodes (null pointers are listed under the tree). */
  pointers?: { name: string; node: TreeId | null }[];
  note?: string;
}

export interface TreeState {
  trees: TreeView[];
  /** Optional array view in sync with the tree(s), drawn below with the array renderer (ids `ai(i, row)`). */
  array?: ArrayState;
  caption?: string;
  result?: unknown;
}

/** Highlight ids: node and parent→child edge. Node ids must be unique across all trees of a state. */
export const tn = (id: TreeId) => `n:${id}`;
export const te = (parent: TreeId, child: TreeId) => `e:${parent}-${child}`;

/** An element stored in a heap array, with a stable id so the drawing can animate swaps. */
export interface HeapItem {
  id: number;
  v: number;
  /** Optional display label (defaults to v). */
  label?: string;
  /** Optional small text under the node (defaults to the array index), e.g. "L2". */
  sub?: string;
}

/** View of an array-backed binary heap: children of index i are 2i+1 and 2i+2. */
export function heapView(items: HeapItem[], name?: string, opts: { pointers?: { name: string; index: number }[]; note?: string; showIndex?: boolean } = {}): TreeView {
  const children: Record<TreeId, (TreeId | null)[]> = {};
  items.forEach((it, i) => {
    const l = 2 * i + 1;
    const r = 2 * i + 2;
    if (l < items.length) children[it.id] = [items[l].id, r < items.length ? items[r].id : null];
  });
  return {
    name,
    root: items.length ? items[0].id : null,
    nodes: items.map((it, i) => ({ id: it.id, label: it.label ?? String(it.v), sub: it.sub ?? (opts.showIndex === false ? undefined : `[${i}]`) })),
    children,
    pointers: (opts.pointers ?? []).map((p) => ({ name: p.name, node: p.index >= 0 && p.index < items.length ? items[p.index].id : null })),
    note: opts.note,
  };
}

/** Parent index and depth helpers using integer arithmetic only. */
export const parentOf = (i: number) => (i - 1) >> 1;
export function depthOf(i: number): number {
  let d = 0;
  for (let k = i + 1; k > 1; k >>= 1) d++;
  return d;
}

/**
 * Sift events for array heaps. `less(a, b)` is true when a must sit above b (min-heap: a.v < b.v).
 * The generators mutate `h` (a swap is applied before its event is yielded) so callers can
 * turn each event into a trace step with their own code line and wording.
 */
export type SiftEvent =
  | { type: "compare"; i: number; j: number } // i = current, j = parent (up) or chosen child (down)
  | { type: "swap"; i: number; j: number } // i moved to j
  | { type: "stop"; i: number; j: number | null }; // settled at i (j = the parent/child it was compared with, if any)

export function* siftUpEvents(h: HeapItem[], i: number, less: (a: HeapItem, b: HeapItem) => boolean): Generator<SiftEvent> {
  while (i > 0) {
    const p = parentOf(i);
    yield { type: "compare", i, j: p };
    if (!less(h[i], h[p])) {
      yield { type: "stop", i, j: p };
      return;
    }
    [h[i], h[p]] = [h[p], h[i]];
    yield { type: "swap", i, j: p };
    i = p;
  }
  yield { type: "stop", i, j: null };
}

export function* siftDownEvents(h: HeapItem[], i: number, less: (a: HeapItem, b: HeapItem) => boolean, size = h.length): Generator<SiftEvent> {
  for (;;) {
    const l = 2 * i + 1;
    const r = l + 1;
    let best = i;
    if (l < size && less(h[l], h[best])) best = l;
    if (r < size && less(h[r], h[best])) best = r;
    if (l >= size) {
      yield { type: "stop", i, j: null };
      return;
    }
    const child = r < size && less(h[r], h[l]) ? r : l;
    yield { type: "compare", i, j: child };
    if (best === i) {
      yield { type: "stop", i, j: child };
      return;
    }
    [h[i], h[best]] = [h[best], h[i]];
    yield { type: "swap", i, j: best };
    i = best;
  }
}

export const minFirst = (a: HeapItem, b: HeapItem) => a.v < b.v;
export const maxFirst = (a: HeapItem, b: HeapItem) => a.v > b.v;
