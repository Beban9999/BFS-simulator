import type { GraphField, Rng } from "../../engine/types";
import type { Edge, GraphValue } from "../../engine/graph";
import { randInt, shuffle } from "../../engine/random";
import type { ArrayState } from "./array";
import type { MatrixState } from "./matrix";
import type { TreeView } from "./tree";
export { tn, te } from "./tree";

export type { Edge, GraphValue } from "../../engine/graph";

/** What the graph renderer draws. Same node numbering as the input graph. */
export interface GraphView {
  n: number;
  edges: Edge[];
  directed: boolean;
  /** Unit-square layout, one [x, y] per node. */
  pos: [number, number][];
  labels?: string[];
  /** Small text under each node, e.g. a distance ("∞", "4") or discovery time. */
  sub?: (string | null)[];
  /** Colour group per node (components, bipartite sides, SCCs…), drawn as a coloured ring; 0–5. */
  groups?: (number | null)[];
  /** Hide nodes (e.g. not created yet). */
  hidden?: number[];
  /** Draw edge weights (default: when edges carry a weight). */
  showWeights?: boolean;
  name?: string;
}

export interface GraphState {
  graph?: GraphView;
  /** Extra forests drawn beside the graph (e.g. union-find), with the tree renderer (ids `tn` / `te`). */
  trees?: TreeView[];
  /** Arrays under the drawing (ids `ai(i, row)`). */
  array?: ArrayState;
  /** A table under the drawing (ids `mi(r, c)`), e.g. an adjacency or distance matrix. */
  matrix?: MatrixState;
  caption?: string;
  result?: unknown;
}

/** Highlight ids: node, and edge u→v (for undirected graphs either order matches). */
export const gn = (i: number) => `gn:${i}`;
export const ge = (u: number, v: number) => `ge:${u}-${v}`;

export const GROUP_COUNT = 6;

export function graphField(key: string, label: string, opts: Partial<GraphField> = {}): GraphField {
  return { key, label, kind: "graph", maxNodes: 14, ...opts };
}

export const nameOf = (g: { labels?: string[] }, i: number) => g.labels?.[i] ?? String(i);

export interface Adj {
  to: number;
  w: number;
}

/** Adjacency lists, neighbours in ascending order (undirected edges appear both ways). */
export function adjacency(g: GraphValue): Adj[][] {
  const adj: Adj[][] = Array.from({ length: g.n }, () => []);
  for (const [u, v, w = 1] of g.edges) {
    adj[u].push({ to: v, w });
    if (!g.directed) adj[v].push({ to: u, w });
  }
  for (const list of adj) list.sort((a, b) => a.to - b.to);
  return adj;
}

/** The input graph as a view, laying it out when it has no positions. */
export function graphView(g: GraphValue, extra: Partial<GraphView> = {}): GraphView {
  return {
    n: g.n,
    edges: g.edges,
    directed: g.directed,
    pos: g.pos ?? autoLayout(g),
    ...(g.labels ? { labels: g.labels } : {}),
    ...extra,
  };
}

/* ---------- Layout ---------- */

const round = (x: number) => Math.round(x * 1000) / 1000;

function normalize(p: [number, number][]): [number, number][] {
  const xs = p.map((q) => q[0]);
  const ys = p.map((q) => q[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const sx = x1 - x0 || 1;
  const sy = y1 - y0 || 1;
  return p.map(([x, y]) => [round(x1 === x0 ? 0.5 : 0.05 + ((x - x0) / sx) * 0.9), round(y1 === y0 ? 0.5 : 0.06 + ((y - y0) / sy) * 0.88)]);
}

/** Deterministic force-directed layout (Fruchterman–Reingold from a circle). */
export function autoLayout(g: { n: number; edges: Edge[]; directed?: boolean }): [number, number][] {
  const n = g.n;
  if (n === 1) return [[0.5, 0.5]];
  const p: [number, number][] = Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
    return [0.5 + 0.4 * Math.cos(a), 0.5 + 0.4 * Math.sin(a)];
  });
  const k = 0.9 * Math.sqrt(1 / n);
  let temp = 0.08;
  for (let it = 0; it < 260; it++) {
    const d: [number, number][] = p.map(() => [0, 0]);
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++) {
        const dx = p[i][0] - p[j][0];
        const dy = p[i][1] - p[j][1];
        const dist = Math.max(0.01, Math.hypot(dx, dy));
        const f = (k * k) / dist;
        d[i][0] += (dx / dist) * f;
        d[i][1] += (dy / dist) * f;
        d[j][0] -= (dx / dist) * f;
        d[j][1] -= (dy / dist) * f;
      }
    for (const [u, v] of g.edges) {
      const dx = p[u][0] - p[v][0];
      const dy = p[u][1] - p[v][1];
      const dist = Math.max(0.01, Math.hypot(dx, dy));
      const f = (dist * dist) / k;
      d[u][0] -= (dx / dist) * f;
      d[u][1] -= (dy / dist) * f;
      d[v][0] += (dx / dist) * f;
      d[v][1] += (dy / dist) * f;
    }
    for (let i = 0; i < n; i++) {
      d[i][0] += (0.5 - p[i][0]) * 0.6 * k;
      d[i][1] += (0.5 - p[i][1]) * 0.6 * k;
      const len = Math.hypot(d[i][0], d[i][1]) || 1;
      const step = Math.min(len, temp);
      p[i][0] += (d[i][0] / len) * step;
      p[i][1] += (d[i][1] / len) * step;
    }
    temp *= 0.985;
  }
  return normalize(p);
}

/** Left-to-right layers by longest path from a source (for DAGs); falls back to autoLayout on cycles. */
export function layeredLayout(g: { n: number; edges: Edge[] }): [number, number][] {
  const indeg = Array(g.n).fill(0);
  const out: number[][] = Array.from({ length: g.n }, () => []);
  for (const [u, v] of g.edges) {
    out[u].push(v);
    indeg[v]++;
  }
  const layer = Array(g.n).fill(0);
  const queue = indeg.map((d, i) => (d === 0 ? i : -1)).filter((i) => i >= 0);
  let seen = 0;
  for (let h = 0; h < queue.length; h++) {
    const u = queue[h];
    seen++;
    for (const v of out[u]) {
      layer[v] = Math.max(layer[v], layer[u] + 1);
      if (--indeg[v] === 0) queue.push(v);
    }
  }
  if (seen < g.n) return autoLayout(g);
  const layers = Math.max(...layer) + 1;
  const rows: number[][] = Array.from({ length: layers }, () => []);
  for (let i = 0; i < g.n; i++) rows[layer[i]].push(i);
  const p: [number, number][] = Array(g.n);
  rows.forEach((row, L) =>
    row.forEach((v, j) => {
      p[v] = [layers === 1 ? 0.5 : L / (layers - 1), row.length === 1 ? 0.5 : (j + 0.5) / row.length];
    }),
  );
  return normalize(p);
}

/* ---------- Random graphs ---------- */

export interface RandomGraphOptions {
  directed?: boolean;
  weighted?: boolean;
  minW?: number;
  maxW?: number;
  /** Extra edges beyond a spanning tree, as a fraction of n (default 0.6). */
  density?: number;
  /** Start from a random spanning tree so the graph is connected (default true). */
  connected?: boolean;
  /** Directed edges only go "forward" in a hidden random order. */
  dag?: boolean;
  maxNodes?: number;
  minNodes?: number;
}

export function randomGraph(rng: Rng, size: number, o: RandomGraphOptions = {}): GraphValue {
  const n = Math.max(o.minNodes ?? 2, Math.min(o.maxNodes ?? 10, size));
  const directed = !!(o.directed || o.dag);
  const order = shuffle(rng, Array.from({ length: n }, (_, i) => i));
  const rank = Array(n);
  order.forEach((v, i) => (rank[v] = i));
  const keys = new Set<string>();
  const edges: Edge[] = [];
  const add = (a: number, b: number) => {
    if (a === b) return false;
    let u = a;
    let v = b;
    if (o.dag && rank[u] > rank[v]) [u, v] = [v, u];
    else if (directed && !o.dag && rng() < 0.5) [u, v] = [v, u];
    const key = directed ? `${u}>${v}` : `${Math.min(u, v)}-${Math.max(u, v)}`;
    if (keys.has(key)) return false;
    keys.add(key);
    edges.push(o.weighted ? [u, v, randInt(rng, o.minW ?? 1, o.maxW ?? 9)] : [u, v]);
    return true;
  };
  if (o.connected !== false) for (let i = 1; i < n; i++) add(order[i], order[randInt(rng, 0, i - 1)]);
  const extra = Math.round(n * (o.density ?? 0.6));
  for (let tries = 0, made = 0; made < extra && tries < extra * 6; tries++) if (add(randInt(rng, 0, n - 1), randInt(rng, 0, n - 1))) made++;
  edges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  return { n, edges, directed };
}

/** Lay out a preset written as node positions on a small integer grid (x right, y down). */
export function gridPos(points: [number, number][]): [number, number][] {
  return normalize(points.map(([x, y]) => [x, y]));
}

/* ---------- Shared sample graphs ---------- */

/** 8 nodes, one cycle-rich undirected graph used by the traversal pages. */
export const SAMPLE_UNDIRECTED: GraphValue = {
  n: 8,
  directed: false,
  edges: [[0, 1], [0, 2], [1, 2], [1, 3], [2, 4], [3, 5], [4, 5], [5, 6], [5, 7], [6, 7]],
  pos: gridPos([[0, 1], [1, 0], [1, 2], [2, 0], [2, 2], [3, 1], [4, 0], [4, 2]]),
};

/** Two components: a triangle and a square with a tail. */
export const SAMPLE_TWO_PARTS: GraphValue = {
  n: 8,
  directed: false,
  edges: [[0, 1], [1, 2], [0, 2], [3, 4], [4, 5], [5, 6], [6, 3], [6, 7]],
  pos: gridPos([[0, 0], [1, 1], [0, 2], [3, 0], [4, 0], [4, 2], [3, 2], [2, 2]]),
};

/** A simple path 0-1-…-(n-1): deepest recursion / longest queue chain. */
export function lineGraph(n: number): GraphValue {
  return {
    n,
    directed: false,
    edges: Array.from({ length: n - 1 }, (_, i) => [i, i + 1] as Edge),
    pos: Array.from({ length: n }, (_, i) => [round(0.05 + (0.9 * i) / Math.max(1, n - 1)), 0.5] as [number, number]),
  };
}

/** Directed graph with a cycle 1→2→3→1 and a tail. */
export const SAMPLE_DIRECTED: GraphValue = {
  n: 7,
  directed: true,
  edges: [[0, 1], [0, 4], [1, 2], [2, 3], [3, 1], [3, 5], [4, 5], [5, 6]],
  pos: gridPos([[0, 1], [1, 0], [2, 0], [2, 1], [1, 2], [3, 2], [4, 2]]),
};

/** `{ key: "source" }` number field; pair with `sourceCheck` in validate. */
export function sourceField(key = "source", label = "Start node") {
  return { key, label, kind: "number" as const, integer: true, min: 0, max: 30 };
}

export const sourceCheck = (g: GraphValue, s: number, label = "Start node") => (s >= g.n ? `${label} must be between 0 and ${g.n - 1}.` : null);

/** Course-schedule style DAG (edge u→v: u must come before v), laid out in layers. */
export const SAMPLE_DAG: GraphValue = (() => {
  const g: GraphValue = { n: 8, directed: true, edges: [[0, 2], [1, 2], [1, 3], [2, 4], [3, 4], [3, 5], [4, 6], [5, 6], [6, 7]] };
  return { ...g, pos: layeredLayout(g) };
})();

/** The same DAG plus one edge 6→3 that closes the cycle 3→4→6→3. */
export const SAMPLE_DAG_CYCLE: GraphValue = { ...SAMPLE_DAG, edges: [...SAMPLE_DAG.edges, [6, 3]] };

/** Random directed graph that is a DAG most of the time (a back edge is added with probability `cycleChance`). */
export function randomDagish(rng: Rng, size: number, cycleChance = 0.3, maxNodes = 10): GraphValue {
  const g = randomGraph(rng, size, { dag: true, density: 0.5, maxNodes, minNodes: 2 });
  if (rng() < cycleChance && g.edges.length) {
    const [u, v] = g.edges[randInt(rng, 0, g.edges.length - 1)];
    // An edge from any descendant w of v back to u closes the cycle u→v→…→w→u.
    const below = [v];
    for (let i = 0; i < below.length; i++) for (const [a, b] of g.edges) if (a === below[i] && !below.includes(b)) below.push(b);
    const w = below[randInt(rng, 0, below.length - 1)];
    if (!g.edges.some(([a, b]) => a === w && b === u)) g.edges.push([w, u]);
  }
  return { ...g, pos: layeredLayout({ n: g.n, edges: g.edges }) };
}

/** Union-Find parent array drawn as a forest (one tree per root; node ids = element ids, sub-label = rank). */
export function dsuForest(parent: number[], rank?: number[], opts: { singletons?: boolean } = {}): TreeView[] {
  const kids: Record<number, number[]> = {};
  parent.forEach((p, v) => {
    if (p !== v) (kids[p] ??= []).push(v);
  });
  return parent.flatMap((p, v) => {
    if (p !== v) return [];
    if (!kids[v] && opts.singletons === false) return [];
    const members: number[] = [];
    const stack = [v];
    while (stack.length) {
      const x = stack.pop()!;
      members.push(x);
      stack.push(...(kids[x] ?? []));
    }
    members.sort((a, b) => a - b);
    return [
      {
        root: v,
        nodes: members.map((x) => ({ id: x, label: String(x), sub: rank && x === v ? `r${rank[x]}` : undefined })),
        children: Object.fromEntries(members.filter((x) => kids[x]).map((x) => [x, kids[x]])),
      },
    ];
  });
}

/** Colour group per element: sets with more than one member get 0, 1, 2… by their smallest element. */
export function dsuGroups(roots: number[]): (number | null)[] {
  const size = new Map<number, number>();
  roots.forEach((r) => size.set(r, (size.get(r) ?? 0) + 1));
  const order = new Map<number, number>();
  roots.forEach((r) => {
    if ((size.get(r) ?? 0) > 1 && !order.has(r)) order.set(r, order.size);
  });
  return roots.map((r) => order.get(r) ?? null);
}

/** Classic 6-node weighted undirected graph (the textbook Dijkstra example). */
export const SAMPLE_WEIGHTED: GraphValue = {
  n: 6,
  directed: false,
  edges: [[0, 1, 7], [0, 2, 9], [0, 5, 14], [1, 2, 10], [1, 3, 15], [2, 3, 11], [2, 5, 2], [3, 4, 6], [4, 5, 9]],
  pos: gridPos([[0, 2], [1, 3.4], [1.7, 1.9], [3.4, 3.4], [4.2, 1.2], [2, 0]]),
};

/** Directed weighted graph where the direct edge 0→4 is a trap: the cheap detour wins. */
export const SAMPLE_WEIGHTED_DIRECTED: GraphValue = {
  n: 6,
  directed: true,
  edges: [[0, 1, 2], [0, 4, 12], [1, 2, 3], [1, 3, 8], [2, 3, 1], [2, 5, 9], [3, 4, 2], [3, 5, 6], [4, 5, 1]],
  pos: gridPos([[0, 1], [1, 0], [2, 0], [3, 1], [2, 2], [4, 1]]),
};

export const INF_LABEL = "∞";
export const distLabel = (d: number | null) => (d === null ? INF_LABEL : String(d));
