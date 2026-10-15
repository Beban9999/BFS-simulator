import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { ai } from "../../_shared/array";
import { SAMPLE_WEIGHTED, dsuForest, dsuGroups, ge, gn, graphField, gridPos, graphView, randomGraph, tn, type GraphState, type GraphValue } from "../../_shared/graph";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  graph: GraphValue;
}

interface Output {
  total: number;
  taken: number;
}

function* generate({ graph }: Input) {
  const t = new Tracer<GraphState>();
  const n = graph.n;
  const base = graphView(graph);
  const parent = Array.from({ length: n }, (_, i) => i);
  const sorted = graph.edges.map(([u, v, w]) => [u, v, w ?? 1] as [number, number, number]).sort((a, b) => a[2] - b[2] || a[0] - b[0] || a[1] - b[1]);
  const taken: number[] = [];
  const skipped: number[] = [];
  let total = 0;

  const find = (x: number) => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };
  const root = (x: number) => {
    while (parent[x] !== x) x = parent[x];
    return x;
  };
  const state = (i: number | null, result?: Output): GraphState => ({
    graph: { ...base, groups: dsuGroups(parent.map((_, v) => root(v))) },
    trees: dsuForest(parent),
    array: {
      rows: sorted.length
        ? [
            { label: "sorted", values: sorted.map(([u, v]) => `${u}–${v}`) },
            { label: "weight", values: sorted.map(([, , w]) => w), hideIndex: true },
          ]
        : [{ label: "sorted", values: ["–"] }],
      pointers: i === null ? [] : [{ name: "e", index: i }],
    },
    caption: `MST weight so far: ${total} (${taken.length} of ${n - 1} edges)`,
    result,
  });
  const marks = (): Highlight[] => [
    ...hl("path", ...taken.map((k) => ge(sorted[k][0], sorted[k][1])), ...taken.map((k) => ai(k))),
    ...hl("pruned", ...skipped.map((k) => ge(sorted[k][0], sorted[k][1])), ...skipped.map((k) => ai(k))),
  ];

  yield t.step("sort", `Sort the ${sorted.length} edges by weight: ${sorted.map(([u, v, w]) => `${u}–${v}(${w})`).join(", ") || "none"}. Every node starts as its own component.`, {
    state: state(null),
    vars: { V: n, E: sorted.length },
  });

  for (let i = 0; i < sorted.length; i++) {
    const [u, v, w] = sorted[i];
    const ru = find(u);
    const rv = find(v);
    t.count("comparisons");
    yield t.step("consider", `Next lightest edge ${u}–${v} (weight ${w}): find(${u}) = ${ru}, find(${v}) = ${rv}.`, {
      state: state(i),
      vars: { u, v, w, ru, rv, total },
      highlights: [...marks(), ...hl("current", ge(u, v), gn(u), gn(v), ai(i)), ...hl("found", tn(ru), tn(rv))],
    });
    if (ru === rv) {
      skipped.push(i);
      yield t.step("skip", `${u} and ${v} are already in the same component (root ${ru}); this edge would close a cycle. Skip it.`, {
        state: state(i),
        vars: { u, v, w, total },
        highlights: [...marks(), ...hl("mismatch", ge(u, v), ai(i))],
      });
      continue;
    }
    parent[ru] = rv;
    taken.push(i);
    total += w;
    t.count("writes");
    yield t.step("take", `Different components: take ${u}–${v} into the tree and merge them (parent[${ru}] = ${rv}). Total = ${total}.`, {
      state: state(i),
      vars: { u, v, w, total, taken: taken.length },
      highlights: [...marks(), ...hl("found", ge(u, v), ai(i), tn(rv))],
    });
    if (taken.length === n - 1) {
      yield t.step("full", `${n - 1} edges taken — the tree spans all ${n} nodes. The remaining ${sorted.length - i - 1} edge${sorted.length - i - 1 === 1 ? "" : "s"} can be ignored.`, {
        state: state(null),
        vars: { total },
        highlights: marks(),
      });
      break;
    }
  }
  const comps = n - taken.length;
  yield t.step(
    "done",
    comps === 1 ? `Minimum spanning tree: ${taken.length} edges, total weight ${total}.` : `The graph has ${comps} components, so this is a minimum spanning forest: ${taken.length} edges, total weight ${total}.`,
    { state: state(null, { total, taken: taken.length }), vars: { total, taken: taken.length }, highlights: marks() },
  );
}

function reference({ graph }: Input): Output {
  // Prim from every not-yet-covered node (minimum spanning forest), O(V²).
  const n = graph.n;
  const w: number[][] = Array.from({ length: n }, () => Array(n).fill(Infinity));
  for (const [u, v, x = 1] of graph.edges) w[u][v] = w[v][u] = Math.min(w[u][v], x);
  const inTree = Array(n).fill(false);
  let total = 0;
  let taken = 0;
  for (let s = 0; s < n; s++) {
    if (inTree[s]) continue;
    const best = Array(n).fill(Infinity);
    best[s] = 0;
    for (;;) {
      let u = -1;
      for (let v = 0; v < n; v++) if (!inTree[v] && best[v] < Infinity && (u < 0 || best[v] < best[u])) u = v;
      if (u < 0) break;
      inTree[u] = true;
      if (u !== s) {
        total += best[u];
        taken++;
      }
      for (let v = 0; v < n; v++) if (!inTree[v] && w[u][v] < best[v]) best[v] = w[u][v];
    }
  }
  return { total, taken };
}

const algorithm: AlgorithmModule<Input, GraphState> = {
  ...meta,
  renderer: "graph",
  inputSchema: { fields: [graphField("graph", "Weighted undirected graph", { directed: false, weighted: true, minWeight: -99, maxWeight: 99, maxNodes: 10 })] },
  presets: [
    { name: "Textbook graph (6 nodes)", input: { graph: SAMPLE_WEIGHTED } },
    {
      name: "Many ties (several valid MSTs)",
      input: {
        graph: {
          n: 6,
          directed: false,
          edges: [[0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 0, 1], [0, 2, 2], [2, 4, 2], [3, 5, 2], [4, 5, 1]],
          pos: gridPos([[0, 0], [1, 0], [1, 1], [0, 1], [2, 1], [1, 2]]),
        },
      },
    },
    {
      name: "Edge case: disconnected (spanning forest)",
      input: { graph: { n: 6, directed: false, edges: [[0, 1, 4], [1, 2, 2], [0, 2, 5], [3, 4, 3], [4, 5, 1], [3, 5, 2]], pos: gridPos([[0, 0], [1, 1], [0, 2], [3, 0], [4, 1], [3, 2]]) } },
    },
    {
      name: "Heavy cycle: the biggest edge is left out",
      input: { graph: { n: 5, directed: false, edges: [[0, 1, 2], [1, 2, 3], [2, 3, 4], [3, 4, 5], [4, 0, 9], [1, 3, 6]], pos: gridPos([[1, 0], [2, 0.8], [1.6, 2], [0.4, 2], [0, 0.8]]) } },
    },
  ],
  randomInput: (size, rng = Math.random) => ({ graph: randomGraph(rng, size, { weighted: true, minW: 1, maxW: 9, density: 0.9, maxNodes: 9, minNodes: 2, connected: rng() < 0.85 }) }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (state) => state.result,
  info,
  legendLabels: { path: "In the tree", pruned: "Rejected (cycle)", current: "Edge considered", found: "Roots / just taken", mismatch: "Would close a cycle" },
};

export default algorithm;
