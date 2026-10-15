import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import {
  SAMPLE_WEIGHTED,
  SAMPLE_WEIGHTED_DIRECTED,
  adjacency,
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
  const adj = adjacency(graph);
  const base = graphView(graph);
  const n = graph.n;
  const dist: (number | null)[] = Array(n).fill(null);
  const prev: (number | null)[] = Array(n).fill(null);
  const settled: boolean[] = Array(n).fill(false);
  let heap: [number, number][] = [[0, source]];
  dist[source] = 0;
  const arrow = graph.directed ? "→" : "–";

  const state = (done = false): GraphState => ({
    graph: { ...base, sub: dist.map((d) => (d === null ? "∞" : `${d}`)) },
    array: { rows: [{ label: "dist", values: dist.map(distLabel) }] },
    result: done ? dist : undefined,
  });
  const marks = (): Highlight[] => [
    ...prev.flatMap((p, v) => (p === null ? [] : hl("path", ge(p, v)))),
    ...hl("frontier", ...heap.filter(([d, v]) => !settled[v] && d === dist[v]).map(([, v]) => gn(v))),
    ...hl("visited", ...settled.flatMap((s, v) => (s ? [gn(v)] : []))),
  ];
  const aux = (hi?: number) => [
    { label: "min-heap (d, node)", kind: "heap" as const, items: heap.map(([d, v]) => `(${d}, ${v})`), highlight: hi === undefined ? undefined : [hi] },
  ];
  const push = (d: number, v: number) => {
    heap.push([d, v]);
    heap.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    return heap.findIndex(([x, y]) => x === d && y === v);
  };

  yield t.step("init", `dist[${source}] = 0, every other node starts at ∞. The heap holds (0, ${source}).`, { state: state(), vars: { source }, aux: aux(0), highlights: marks() });

  while (heap.length) {
    const [d, u] = heap[0];
    heap = heap.slice(1);
    t.count("pops");
    if (d > dist[u]!) {
      yield t.step("stale", `Pop (${d}, ${u}): stale, since dist[${u}] was already lowered to ${dist[u]}. Skip it.`, {
        state: state(),
        vars: { d, u, "dist[u]": dist[u] },
        aux: aux(),
        highlights: [...marks(), ...hl("pruned", gn(u))],
      });
      continue;
    }
    settled[u] = true;
    yield t.step("pop", `Pop (${d}, ${u}): the closest unsettled node. dist[${u}] = ${d} is final.`, {
      state: state(),
      vars: { d, u },
      aux: aux(),
      highlights: [...marks(), ...hl("current", gn(u))],
    });
    for (const { to: v, w } of adj[u]) {
      t.count("comparisons");
      const cand = d + w;
      const old = dist[v];
      if (old !== null && cand >= old) {
        yield t.step("relax", `Edge ${u}${arrow}${v} (weight ${w}): ${d} + ${w} = ${cand} is not better than dist[${v}] = ${old}.`, {
          state: state(),
          vars: { u, v, w, "d + w": cand, "dist[v]": old },
          aux: aux(),
          highlights: [...marks(), ...hl("current", gn(u)), ...hl("compare", ge(u, v))],
        });
        continue;
      }
      dist[v] = cand;
      prev[v] = u;
      const at = push(cand, v);
      t.count("pushes");
      yield t.step("improve", `Edge ${u}${arrow}${v} (weight ${w}): ${d} + ${w} = ${cand} beats ${old === null ? "∞" : old}. Set dist[${v}] = ${cand} and push (${cand}, ${v}).`, {
        state: state(),
        vars: { u, v, w, "d + w": cand },
        aux: aux(at),
        highlights: [...marks(), ...hl("current", gn(u)), ...hl("found", ge(u, v), gn(v))],
      });
    }
  }

  const unreached = dist.flatMap((x, v) => (x === null ? [v] : []));
  yield t.step("done", `Heap empty. Shortest distances from ${source}: ${dist.map((x, v) => `${v}:${distLabel(x)}`).join(", ")}.` + (unreached.length ? ` Unreachable: ${unreached.join(", ")}.` : ""), {
    state: state(true),
    vars: { settled: n - unreached.length },
    aux: aux(),
    highlights: [...marks(), ...hl("pruned", ...unreached.map(gn))],
  });
}

function reference({ graph, source }: Input): (number | null)[] {
  // O(V²) Dijkstra without a heap.
  const adj = adjacency(graph);
  const dist: (number | null)[] = Array(graph.n).fill(null);
  const done = Array(graph.n).fill(false);
  dist[source] = 0;
  for (;;) {
    let u = -1;
    for (let v = 0; v < graph.n; v++) if (!done[v] && dist[v] !== null && (u < 0 || dist[v]! < dist[u]!)) u = v;
    if (u < 0) return dist;
    done[u] = true;
    for (const { to, w } of adj[u]) if (dist[to] === null || dist[u]! + w < dist[to]!) dist[to] = dist[u]! + w;
  }
}

const algorithm: AlgorithmModule<Input, GraphState> = {
  ...meta,
  renderer: "graph",
  inputSchema: {
    fields: [graphField("graph", "Weighted graph", { weighted: true, minWeight: 0, maxWeight: 99, maxNodes: 12 }), sourceField()],
    validate: ({ graph, source }) => sourceCheck(graph, source),
  },
  presets: [
    { name: "Textbook example (undirected)", input: { graph: SAMPLE_WEIGHTED, source: 0 } },
    { name: "Directed: the direct edge is a trap", input: { graph: SAMPLE_WEIGHTED_DIRECTED, source: 0 } },
    {
      name: "Stale heap entries (a node improves twice)",
      input: { graph: { n: 4, directed: true, edges: [[0, 1, 1], [0, 2, 9], [0, 3, 14], [1, 2, 5], [1, 3, 10], [2, 3, 1]], pos: gridPos([[0, 1], [1, 0], [2, 1], [3, 1]]) }, source: 0 },
    },
    {
      name: "Edge case: unreachable node and 0-weight edge",
      input: { graph: { n: 5, directed: true, edges: [[0, 1, 0], [1, 2, 3], [0, 2, 4], [3, 4, 1]], pos: gridPos([[0, 0], [1, 0], [2, 0], [0, 1], [2, 1]]) }, source: 0 },
    },
  ],
  randomInput: (size, rng = Math.random) => {
    const graph = randomGraph(rng, size, { directed: rng() < 0.4, weighted: true, minW: 1, maxW: 9, density: 0.7, maxNodes: 10, minNodes: 2 });
    return { graph, source: randInt(rng, 0, graph.n - 1) };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (state) => state.result,
  info,
  legendLabels: { visited: "Settled (final)", frontier: "In the heap", path: "Shortest-path tree", current: "Popped node", compare: "No improvement", found: "Improved", pruned: "Stale / unreachable" },
};

export default algorithm;
