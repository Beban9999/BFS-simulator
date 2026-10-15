import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { adjacency, distLabel, ge, gn, graphField, gridPos, graphView, randomGraph, sourceCheck, sourceField, type GraphState, type GraphValue } from "../../_shared/graph";
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
  const dist: (number | null)[] = Array(graph.n).fill(null);
  const prev: (number | null)[] = Array(graph.n).fill(null);
  dist[source] = 0;
  const dq: number[] = [source];
  const arrow = graph.directed ? "→" : "–";

  const state = (done = false): GraphState => ({
    graph: { ...base, sub: dist.map(distLabel) },
    array: { rows: [{ label: "dist", values: dist.map(distLabel) }] },
    result: done ? dist : undefined,
  });
  const marks = (): Highlight[] => [...prev.flatMap((p, v) => (p === null ? [] : hl("path", ge(p, v)))), ...hl("frontier", ...dq.map(gn))];
  const aux = (hi?: number) => [{ label: "deque (front → back) as node:dist", kind: "deque" as const, items: dq.map((v) => `${v}:${distLabel(dist[v])}`), highlight: hi === undefined ? undefined : [hi] }];

  yield t.step("init", `dist[${source}] = 0; the deque starts with ${source}.`, { state: state(), vars: { source }, aux: aux(0), highlights: marks() });
  while (dq.length) {
    const u = dq.shift()!;
    t.count("pops");
    yield t.step("pop", `Pop ${u} from the front (dist ${dist[u]}).`, { state: state(), vars: { u, "dist[u]": dist[u] }, aux: aux(), highlights: [...marks(), ...hl("current", gn(u))] });
    for (const { to: v, w } of adj[u]) {
      t.count("comparisons");
      const cand = dist[u]! + w;
      if (dist[v] !== null && cand >= dist[v]!) {
        yield t.step("relax", `Edge ${u}${arrow}${v} (cost ${w}): ${dist[u]} + ${w} = ${cand} is not below ${dist[v]}.`, {
          state: state(),
          vars: { u, v, w },
          aux: aux(),
          highlights: [...marks(), ...hl("current", gn(u)), ...hl("compare", ge(u, v))],
        });
        continue;
      }
      const old = dist[v];
      dist[v] = cand;
      prev[v] = u;
      if (w === 0) {
        dq.unshift(v);
        t.count("pushes");
        yield t.step("front", `Edge ${u}${arrow}${v} is free: dist[${v}] = ${cand} (was ${distLabel(old)}), same as ${u}, so push ${v} to the FRONT.`, {
          state: state(),
          vars: { u, v, w, "dist[v]": cand },
          aux: aux(0),
          highlights: [...marks(), ...hl("current", gn(u)), ...hl("found", ge(u, v), gn(v))],
        });
      } else {
        dq.push(v);
        t.count("pushes");
        yield t.step("back", `Edge ${u}${arrow}${v} costs 1: dist[${v}] = ${cand} (was ${distLabel(old)}), one more than ${u}, so push ${v} to the BACK.`, {
          state: state(),
          vars: { u, v, w, "dist[v]": cand },
          aux: aux(dq.length - 1),
          highlights: [...marks(), ...hl("current", gn(u)), ...hl("found", ge(u, v), gn(v))],
        });
      }
    }
  }
  yield t.step("done", `Deque empty. Distances: ${dist.map((d, v) => `${v}:${distLabel(d)}`).join(", ")}.`, { state: state(true), vars: {}, aux: aux(), highlights: marks() });
}

function reference({ graph, source }: Input): (number | null)[] {
  const adj = adjacency(graph);
  const dist: (number | null)[] = Array(graph.n).fill(null);
  dist[source] = 0;
  for (let r = 0; r < graph.n; r++) adj.forEach((list, u) => list.forEach(({ to, w }) => dist[u] !== null && (dist[to] === null || dist[u]! + w < dist[to]!) && (dist[to] = dist[u]! + w)));
  return dist;
}

const algorithm: AlgorithmModule<Input, GraphState> = {
  ...meta,
  renderer: "graph",
  inputSchema: {
    fields: [graphField("graph", "Graph with 0/1 weights", { weighted: true, minWeight: 0, maxWeight: 1, maxNodes: 12 }), sourceField()],
    validate: ({ graph, source }) => sourceCheck(graph, source),
  },
  presets: [
    {
      name: "Free shortcuts (0-edges) beat fewer hops",
      input: {
        graph: {
          n: 7,
          directed: false,
          edges: [[0, 1, 1], [0, 2, 0], [2, 3, 0], [3, 4, 0], [4, 1, 0], [1, 5, 1], [4, 6, 1], [5, 6, 0]],
          pos: gridPos([[0, 1], [2, 0], [0.5, 2], [1.5, 2.4], [2.5, 2], [3.5, 0], [3.5, 2]]),
        },
        source: 0,
      },
    },
    {
      name: "Directed: a node improves after it was queued",
      input: { graph: { n: 5, directed: true, edges: [[0, 1, 1], [0, 2, 1], [2, 3, 0], [3, 1, 0], [1, 4, 1]], pos: gridPos([[0, 1], [2, 0], [1, 2], [2, 2], [3, 1]]) }, source: 0 },
    },
    { name: "Edge case: all edges cost 1 (plain BFS)", input: { graph: { n: 5, directed: false, edges: [[0, 1, 1], [1, 2, 1], [0, 3, 1], [3, 4, 1]], pos: gridPos([[0, 1], [1, 0], [2, 0], [1, 2], [2, 2]]) }, source: 0 } },
    { name: "Edge case: everything free", input: { graph: { n: 4, directed: false, edges: [[0, 1, 0], [1, 2, 0], [2, 3, 0]], pos: gridPos([[0, 0], [1, 0], [2, 0], [3, 0]]) }, source: 1 } },
  ],
  randomInput: (size, rng = Math.random) => {
    const graph = randomGraph(rng, size, { directed: rng() < 0.4, weighted: true, minW: 0, maxW: 1, density: 0.6, maxNodes: 10, minNodes: 2 });
    return { graph, source: randInt(rng, 0, graph.n - 1) };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (state) => state.result,
  info,
  legendLabels: { frontier: "In the deque", path: "Best predecessor edge", current: "Popped node", compare: "No improvement", found: "Improved" },
};

export default algorithm;
