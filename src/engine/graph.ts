import type { GraphField } from "./types";

/** `[u, v]` or `[u, v, weight]`. For undirected graphs the order of u and v does not matter. */
export type Edge = [number, number] | [number, number, number];

/** Value of a `graph` input field. Nodes are 0..n-1. */
export interface GraphValue {
  n: number;
  edges: Edge[];
  directed: boolean;
  /** Layout in the unit square, one [x, y] per node (auto-computed when missing). */
  pos?: [number, number][];
  /** Display names per node (defaults to the index). */
  labels?: string[];
}

/** Text form: `n=6 directed` (or `undirected`) then edges `0-1:4, 1>2` separated by commas or new lines. */
export function formatGraph(g: GraphValue): string {
  const head = `n=${g.n} ${g.directed ? "directed" : "undirected"}`;
  const sep = g.directed ? ">" : "-";
  const edges = g.edges.map(([u, v, w]) => `${u}${sep}${v}${w === undefined ? "" : `:${w}`}`);
  const lines: string[] = [];
  for (let i = 0; i < edges.length; i += 8) lines.push(edges.slice(i, i + 8).join(", "));
  return [head, ...lines].join("\n");
}

export function parseGraph(text: string, field: GraphField): GraphValue | string {
  const t = text.trim();
  if (t.startsWith("{")) {
    try {
      return JSON.parse(t) as GraphValue;
    } catch {
      return "invalid JSON.";
    }
  }
  const nMatch = /\bn\s*[=:]\s*(\d+)/i.exec(t);
  const dirWord = /\b(undirected|directed)\b/i.exec(t);
  const body = t.replace(/\bn\s*[=:]\s*\d+/i, " ").replace(/\b(undirected|directed)\b/gi, " ");
  const edges: Edge[] = [];
  let sawArrow = false;
  for (const tok of body.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean)) {
    const m = /^(\d+)\s*(->|-|>|\s)\s*(\d+)(?:\s*[:=\s]\s*(-?\d+))?$/.exec(tok);
    if (!m) return `"${tok}" is not an edge (write u-v, u>v or u-v:weight).`;
    if (m[2] === ">" || m[2] === "->") sawArrow = true;
    const u = Number(m[1]);
    const v = Number(m[3]);
    if (m[4] !== undefined) edges.push([u, v, Number(m[4])]);
    else edges.push(field.weighted ? [u, v, 1] : [u, v]);
  }
  const directed = field.directed ?? (dirWord ? dirWord[1].toLowerCase() === "directed" : sawArrow);
  const n = nMatch ? Number(nMatch[1]) : edges.reduce((m, [u, v]) => Math.max(m, u + 1, v + 1), 0);
  return { n, edges, directed };
}

export function checkGraph(value: unknown, field: GraphField): string | null {
  if (!value || typeof value !== "object") return "must be a graph object { n, edges, directed }.";
  const g = value as GraphValue;
  if (!Number.isInteger(g.n) || g.n < (field.minNodes ?? 1)) return `needs at least ${field.minNodes ?? 1} node${(field.minNodes ?? 1) === 1 ? "" : "s"}.`;
  if (g.n > field.maxNodes) return `can have at most ${field.maxNodes} nodes.`;
  if (typeof g.directed !== "boolean") return "must say whether it is directed.";
  if (field.directed !== undefined && g.directed !== field.directed) return `must be ${field.directed ? "directed" : "undirected"}.`;
  if (!Array.isArray(g.edges)) return "edges must be a list.";
  const seen = new Set<string>();
  for (const e of g.edges) {
    if (!Array.isArray(e) || e.length < 2 || e.length > 3 || e.some((x) => !Number.isInteger(x))) return "edges must look like [u, v] or [u, v, w].";
    const [u, v, w] = e;
    if (u < 0 || v < 0 || u >= g.n || v >= g.n) return `edge ${u}-${v} uses a node outside 0…${g.n - 1}.`;
    if (u === v) return `self-loop ${u}-${v} is not allowed.`;
    const key = g.directed ? `${u}>${v}` : `${Math.min(u, v)}-${Math.max(u, v)}`;
    if (seen.has(key)) return `edge ${key} appears twice.`;
    seen.add(key);
    if (field.weighted) {
      if (w === undefined) return `edge ${u}-${v} needs a weight.`;
      if (field.minWeight !== undefined && w < field.minWeight) return `weights must be ≥ ${field.minWeight}.`;
      if (field.maxWeight !== undefined && w > field.maxWeight) return `weights must be ≤ ${field.maxWeight}.`;
    } else if (w !== undefined) return "edges must not have weights here.";
  }
  if (g.pos !== undefined) {
    if (!Array.isArray(g.pos) || g.pos.length !== g.n) return "pos must have one [x, y] per node.";
    if (g.pos.some((p) => !Array.isArray(p) || p.length !== 2 || p.some((x) => typeof x !== "number" || x < 0 || x > 1)))
      return "pos values must be [x, y] pairs between 0 and 1.";
  }
  if (g.labels !== undefined && (!Array.isArray(g.labels) || g.labels.length !== g.n || g.labels.some((l) => typeof l !== "string" || l.length > 4)))
    return "labels must be one short string (≤ 4 chars) per node.";
  return null;
}
