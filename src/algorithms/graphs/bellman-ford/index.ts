import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { ai } from "../../_shared/array";
import {
  SAMPLE_WEIGHTED_DIRECTED,
  distLabel,
  ge,
  gn,
  graphField,
  gridPos,
  graphView,
  randomGraph,
  sourceCheck,
  sourceField,
  type GraphState,
  type GraphValue,
} from "../../_shared/graph";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  graph: GraphValue;
  source: number;
}

function* generate({ graph, source }: Input) {
  const t = new Tracer<GraphState>();
  const base = graphView(graph);
  const n = graph.n;
  const edges = graph.edges.map(([u, v, w]) => [u, v, w ?? 1] as [number, number, number]);
  const dist: (number | null)[] = Array(n).fill(null);
  const prev: (number | null)[] = Array(n).fill(null);
  dist[source] = 0;
  let round = 0;

  const state = (i: number | null, result?: (number | null)[] | null): GraphState => ({
    graph: { ...base, sub: dist.map(distLabel) },
    array: {
      rows: [
        { label: "edges", values: edges.map(([u, v, w]) => `${u}→${v}:${w}`) },
        { label: "dist", values: dist.map(distLabel) },
      ],
      pointers: i === null ? [] : [{ name: "e", index: i }],
    },
    caption: round ? `pass ${round} of at most ${n - 1}` : undefined,
    result,
  });
  const marks = (): Highlight[] => prev.flatMap((p, v) => (p === null ? [] : hl("path", ge(p, v))));

  yield t.step("init", `dist[${source}] = 0, all others ∞. Relax all ${edges.length} edges up to ${n - 1} times.`, {
    state: state(null),
    vars: { source, V: n, E: edges.length },
    highlights: [...marks(), ...hl("current", gn(source))],
  });

  for (round = 1; round <= n - 1; round++) {
    let changed = false;
    yield t.step("round", `Pass ${round}: go through the edge list in order.`, { state: state(null), vars: { pass: round }, highlights: marks() });
    for (let i = 0; i < edges.length; i++) {
      const [u, v, w] = edges[i];
      t.count("comparisons");
      const du = dist[u];
      const dv = dist[v];
      if (du === null) {
        yield t.step("relax", `Edge ${u}→${v}: dist[${u}] is still ∞, nothing to relax yet.`, {
          state: state(i),
          vars: { pass: round, u, v, w },
          highlights: [...marks(), ...hl("pruned", ge(u, v)), ...hl("current", ai(i, 0))],
        });
        continue;
      }
      if (dv !== null && du + w >= dv) {
        yield t.step("relax", `Edge ${u}→${v} (${w}): ${du} + ${w} = ${du + w} is not below dist[${v}] = ${dv}.`, {
          state: state(i),
          vars: { pass: round, u, v, w, "dist[u] + w": du + w },
          highlights: [...marks(), ...hl("compare", ge(u, v)), ...hl("current", ai(i, 0))],
        });
        continue;
      }
      dist[v] = du + w;
      prev[v] = u;
      changed = true;
      t.count("writes");
      yield t.step("improve", `Edge ${u}→${v} (${w}): ${du} + ${w} = ${du + w} < ${distLabel(dv)}. dist[${v}] = ${du + w}.`, {
        state: state(i),
        vars: { pass: round, u, v, w, "dist[v]": du + w },
        highlights: [...marks(), ...hl("found", ge(u, v), gn(v), ai(v, 1)), ...hl("current", ai(i, 0))],
      });
    }
    if (!changed) {
      yield t.step("early", `Pass ${round} changed nothing, so every distance is final. Stop early.`, { state: state(null), vars: { pass: round }, highlights: marks() });
      break;
    }
  }
  round = 0;

  for (let i = 0; i < edges.length; i++) {
    const [u, v, w] = edges[i];
    const du = dist[u];
    const dv = dist[v];
    if (du !== null && (dv === null || du + w < dv)) {
      yield t.step("negcycle", `Check pass: edge ${u}→${v} can still be relaxed (${du} + ${w} < ${distLabel(dv)}). Distances would keep dropping: a negative cycle is reachable. Return None.`, {
        state: state(i, null),
        vars: { u, v, w },
        highlights: [...marks(), ...hl("mismatch", ge(u, v), gn(u), gn(v))],
      });
      return;
    }
  }
  yield t.step("done", `Check pass: no edge can be relaxed any more, so there is no reachable negative cycle. Final distances: ${dist.map((d, v) => `${v}:${distLabel(d)}`).join(", ")}.`, {
    state: state(null, dist),
    vars: {},
    highlights: marks(),
  });
}

function reference({ graph, source }: Input): (number | null)[] | null {
  // Shortest walks with at most k edges, k = 0..n; if the n-edge layer still improves something, a negative cycle is reachable.
  const n = graph.n;
  let best: (number | null)[] = Array(n).fill(null);
  best[source] = 0;
  for (let k = 1; k <= n; k++) {
    const next = best.slice();
    let improved = false;
    for (const [u, v, w = 1] of graph.edges)
      if (best[u] !== null && (next[v] === null || best[u]! + w < next[v]!)) {
        next[v] = best[u]! + w;
        improved = true;
      }
    if (k === n && improved) return null;
    best = next;
  }
  return best;
}

const algorithm: AlgorithmModule<Input, GraphState> = {
  ...meta,
  renderer: "graph",
  inputSchema: {
    fields: [graphField("graph", "Weighted directed graph", { directed: true, weighted: true, minWeight: -20, maxWeight: 99, maxNodes: 10 }), sourceField()],
    validate: ({ graph, source }) => sourceCheck(graph, source),
  },
  presets: [
    {
      name: "Negative edges, no negative cycle",
      input: {
        graph: { n: 5, directed: true, edges: [[0, 1, 6], [0, 2, 7], [1, 2, 8], [1, 3, 5], [1, 4, -4], [2, 3, -3], [2, 4, 9], [3, 1, -2], [4, 3, 7]], pos: gridPos([[0, 1], [1, 0], [1, 2], [3, 0], [3, 2]]) },
        source: 0,
      },
    },
    {
      name: "Worst order: edges listed backwards along a chain",
      input: { graph: { n: 5, directed: true, edges: [[3, 4, 1], [2, 3, 1], [1, 2, 1], [0, 1, 1]], pos: gridPos([[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]]) }, source: 0 },
    },
    {
      name: "Edge case: negative cycle 1→2→3→1",
      input: { graph: { n: 5, directed: true, edges: [[0, 1, 4], [1, 2, -2], [2, 3, 1], [3, 1, -1], [3, 4, 2]], pos: gridPos([[0, 1], [1, 0], [2, 0], [1.5, 2], [3, 2]]) }, source: 0 },
    },
    { name: "Positive weights (same answer as Dijkstra)", input: { graph: SAMPLE_WEIGHTED_DIRECTED, source: 0 } },
  ],
  randomInput: (size, rng = Math.random) => {
    const graph = randomGraph(rng, size, { directed: true, weighted: true, minW: -3, maxW: 9, density: 0.5, maxNodes: 8, minNodes: 2 });
    return { graph, source: randInt(rng, 0, graph.n - 1) };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (state) => state.result,
  info,
  legendLabels: { path: "Best predecessor edge", current: "Edge being relaxed", compare: "No improvement", found: "Improved", pruned: "Source side still ∞", mismatch: "Negative cycle evidence" },
};

export default algorithm;
