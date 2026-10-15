import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { mi } from "../../_shared/matrix";
import { SAMPLE_WEIGHTED_DIRECTED, distLabel, ge, gn, graphField, gridPos, graphView, randomGraph, type GraphState, type GraphValue } from "../../_shared/graph";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  graph: GraphValue;
}

function* generate({ graph }: Input) {
  const t = new Tracer<GraphState>();
  const base = graphView(graph);
  const n = graph.n;
  const dist: (number | null)[][] = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : null)));
  for (const [u, v, w = 1] of graph.edges) dist[u][v] = w;
  let k = -1;

  const state = (done = false): GraphState => ({
    graph: base,
    matrix: {
      matrix: dist.map((row) => row.map(distLabel)),
      caption: k < 0 ? "dist[i][j] (row = from, column = to)" : `round k = ${k}: may paths pass through ${k}?`,
    },
    result: done ? dist : undefined,
  });
  const rowCol = () => (k < 0 ? [] : hl("window", ...Array.from({ length: n }, (_, x) => [mi(k, x), mi(x, k)]).flat()));

  yield t.step("init", `Fill the ${n}×${n} table: 0 on the diagonal, the weight for each of the ${graph.edges.length} edges, ∞ elsewhere.`, {
    state: state(),
    vars: { n },
    highlights: hl("found", ...graph.edges.map(([u, v]) => mi(u, v))),
  });

  for (k = 0; k < n; k++) {
    let improved = 0;
    yield t.step("k", `Round k = ${k}: for every pair (i, j), compare dist[i][j] with dist[i][${k}] + dist[${k}][j]. Pairs where either half is ∞ can't improve and are skipped.`, {
      state: state(),
      vars: { k },
      highlights: [...rowCol(), ...hl("pivot", gn(k))],
    });
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        if (i === j || i === k || j === k) continue;
        const a = dist[i][k];
        const b = dist[k][j];
        if (a === null || b === null) continue;
        t.count("comparisons");
        const cur = dist[i][j];
        const via = a + b;
        const routeHl = [...rowCol(), ...hl("compare", mi(i, k), mi(k, j), ge(i, k), ge(k, j)), ...hl("pivot", gn(k)), ...hl("current", mi(i, j), gn(i), gn(j))];
        if (cur !== null && via >= cur) {
          yield t.step("relax", `${i} → ${k} → ${j} costs ${a} + ${b} = ${via}, not better than dist[${i}][${j}] = ${cur}.`, {
            state: state(),
            vars: { k, i, j, "via k": via, "dist[i][j]": cur },
            highlights: routeHl,
          });
          continue;
        }
        dist[i][j] = via;
        improved++;
        t.count("writes");
        yield t.step("improve", `${i} → ${k} → ${j} costs ${a} + ${b} = ${via} < ${distLabel(cur)}: dist[${i}][${j}] = ${via}.`, {
          state: state(),
          vars: { k, i, j, "dist[i][j]": via },
          highlights: [...routeHl, ...hl("found", mi(i, j))],
        });
      }
    if (!improved)
      yield t.step("k", `Routing through ${k} improved nothing.`, { state: state(), vars: { k }, highlights: [...rowCol(), ...hl("pivot", gn(k))] });
  }
  k = -1;
  const finite = dist.flat().filter((d) => d !== null).length - n;
  yield t.step("done", `All ${n} rounds done: the table holds every shortest distance (${finite} reachable ordered pairs, ${n * (n - 1) - finite} unreachable).`, {
    state: state(true),
    vars: {},
  });
}

function reference({ graph }: Input): (number | null)[][] {
  // One Bellman-Ford style relaxation run per source (weights are non-negative here).
  const n = graph.n;
  return Array.from({ length: n }, (_, s) => {
    const d: (number | null)[] = Array(n).fill(null);
    d[s] = 0;
    for (let r = 0; r < n; r++) for (const [u, v, w = 1] of graph.edges) if (d[u] !== null && (d[v] === null || d[u]! + w < d[v]!)) d[v] = d[u]! + w;
    return d;
  });
}

const algorithm: AlgorithmModule<Input, GraphState> = {
  ...meta,
  renderer: "graph",
  inputSchema: { fields: [graphField("graph", "Weighted directed graph", { directed: true, weighted: true, minWeight: 0, maxWeight: 99, maxNodes: 7 })] },
  presets: [
    {
      name: "4 nodes: detours beat direct edges",
      input: { graph: { n: 4, directed: true, edges: [[0, 1, 3], [0, 3, 7], [1, 0, 8], [1, 2, 2], [2, 0, 5], [2, 3, 1], [3, 0, 2]], pos: gridPos([[0, 0], [1, 0], [1, 1], [0, 1]]) } },
    },
    { name: "6 nodes, one direction only", input: { graph: SAMPLE_WEIGHTED_DIRECTED } },
    { name: "Edge case: no edges (all ∞)", input: { graph: { n: 3, directed: true, edges: [], pos: gridPos([[0, 0], [1, 0], [2, 0]]) } } },
    {
      name: "Directed cycle: every pair reachable",
      input: { graph: { n: 5, directed: true, edges: [[0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 4, 1], [4, 0, 1]], pos: gridPos([[1, 0], [2, 0.8], [1.6, 2], [0.4, 2], [0, 0.8]]) } },
    },
  ],
  randomInput: (size, rng = Math.random) => ({ graph: randomGraph(rng, size, { directed: true, weighted: true, minW: 1, maxW: 9, density: 0.6, maxNodes: 6, minNodes: 2 }) }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (state) => state.result,
  info,
  legendLabels: { window: "Row / column k", pivot: "Intermediate node k", current: "Pair (i, j)", compare: "Halves i→k, k→j", found: "Updated / from an edge" },
};

export default algorithm;
