import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { SAMPLE_WEIGHTED, adjacency, ge, gn, graphField, gridPos, graphView, randomGraph, sourceCheck, sourceField, type GraphState, type GraphValue } from "../../_shared/graph";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  graph: GraphValue;
  source: number;
}

type Cand = [number, number, number]; // weight, node, from

function* generate({ graph, source }: Input) {
  const t = new Tracer<GraphState>();
  const adj = adjacency(graph);
  const base = graphView(graph);
  const inTree: boolean[] = Array(graph.n).fill(false);
  const chosen: [number, number][] = [];
  let heap: Cand[] = [[0, source, -1]];
  let total = 0;
  const order = (a: Cand, b: Cand) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

  const state = (done = false): GraphState => ({
    graph: base,
    caption: `tree weight ${total}, ${chosen.length} of ${graph.n - 1} edges`,
    result: done ? { total, taken: chosen.length } : undefined,
  });
  const marks = (): Highlight[] => [
    ...hl("compare", ...heap.filter(([, v, f]) => f >= 0 && !inTree[v]).map(([, v, f]) => ge(f, v))),
    ...hl("path", ...chosen.map(([a, b]) => ge(a, b))),
    ...hl("visited", ...inTree.flatMap((x, v) => (x ? [gn(v)] : []))),
  ];
  const aux = (hi: number[] = []) => [{ label: "min-heap (w, node, from)", kind: "heap" as const, items: heap.map(([w, v, f]) => `(${w}, ${v}, ${f})`), highlight: hi }];

  yield t.step("init", `Start the tree at ${source}: push (0, ${source}, -1) — reaching the start costs nothing.`, { state: state(), vars: { source }, aux: aux([0]), highlights: marks() });
  while (heap.length) {
    const [w, u, from] = heap[0];
    heap = heap.slice(1);
    t.count("pops");
    if (inTree[u]) {
      yield t.step("stale", `Pop (${w}, ${u}, ${from}): ${u} is already in the tree, so edge ${from}–${u} would close a cycle. Skip.`, {
        state: state(),
        vars: { w, u, from },
        aux: aux(),
        highlights: [...marks(), ...hl("pruned", ge(from, u))],
      });
      continue;
    }
    yield t.step("pop", from < 0 ? `Pop (0, ${u}, -1): the start node.` : `Pop (${w}, ${u}, ${from}): the cheapest edge leaving the tree is ${from}–${u} with weight ${w}.`, {
      state: state(),
      vars: { w, u, from },
      aux: aux(),
      highlights: [...marks(), ...hl("current", gn(u)), ...(from >= 0 ? hl("found", ge(from, u)) : [])],
    });
    inTree[u] = true;
    total += w;
    if (from >= 0) chosen.push([from, u]);
    t.count("writes");
    yield t.step("add", from < 0 ? `${u} is the first tree node.` : `Add ${u} and edge ${from}–${u} to the tree. Total weight = ${total}.`, {
      state: state(),
      vars: { u, total, "tree size": chosen.length + 1 },
      aux: aux(),
      highlights: [...marks(), ...hl("current", gn(u))],
    });
    const pushed = adj[u].filter(({ to }) => !inTree[to]);
    if (pushed.length) {
      heap = [...heap, ...pushed.map(({ to, w: wv }) => [wv, to, u] as Cand)].sort(order);
      t.count("pushes", pushed.length);
      yield t.step("push", `Push ${u}'s edges to nodes outside the tree: ${pushed.map(({ to, w: wv }) => `${u}–${to} (${wv})`).join(", ")}.`, {
        state: state(),
        vars: { u, pushed: pushed.length },
        aux: aux(heap.flatMap((c, i) => (c[2] === u ? [i] : []))),
        highlights: [...marks(), ...hl("current", gn(u))],
      });
    }
  }
  yield t.step("done", `Heap empty: the tree spans all ${graph.n} nodes with ${chosen.length} edges, total weight ${total}.`, { state: state(true), vars: { total }, aux: aux(), highlights: marks() });
}

function reference({ graph }: Input) {
  // Kruskal with a naive component relabelling.
  const comp = Array.from({ length: graph.n }, (_, i) => i);
  let total = 0;
  let taken = 0;
  for (const [u, v, w = 1] of [...graph.edges].sort((a, b) => (a[2] ?? 1) - (b[2] ?? 1)))
    if (comp[u] !== comp[v]) {
      const old = comp[v];
      for (let i = 0; i < graph.n; i++) if (comp[i] === old) comp[i] = comp[u];
      total += w;
      taken++;
    }
  return { total, taken };
}

function connected(g: GraphValue): boolean {
  const adj = adjacency(g);
  const seen = new Set([0]);
  const stack = [0];
  while (stack.length) for (const { to } of adj[stack.pop()!]) if (!seen.has(to)) (seen.add(to), stack.push(to));
  return seen.size === g.n;
}

const algorithm: AlgorithmModule<Input, GraphState> = {
  ...meta,
  renderer: "graph",
  inputSchema: {
    fields: [graphField("graph", "Weighted undirected graph", { directed: false, weighted: true, minWeight: -99, maxWeight: 99, maxNodes: 10 }), sourceField()],
    validate: ({ graph, source }) => sourceCheck(graph, source) ?? (connected(graph) ? null : "Prim grows one tree, so the graph must be connected."),
  },
  presets: [
    { name: "Textbook graph (6 nodes)", input: { graph: SAMPLE_WEIGHTED, source: 0 } },
    { name: "Same graph, start at 4 (same total)", input: { graph: SAMPLE_WEIGHTED, source: 4 } },
    {
      name: "Stale entries: a node gets cheaper edges later",
      input: { graph: { n: 5, directed: false, edges: [[0, 1, 9], [0, 2, 1], [2, 1, 2], [2, 3, 8], [1, 3, 1], [3, 4, 3], [0, 4, 7]], pos: gridPos([[0, 1], [2, 0], [1, 2], [3, 1], [2, 2.2]]) }, source: 0 },
    },
    { name: "Edge case: single node", input: { graph: { n: 1, directed: false, edges: [], pos: [[0.5, 0.5]] }, source: 0 } },
  ],
  randomInput: (size, rng = Math.random) => {
    const graph = randomGraph(rng, size, { weighted: true, minW: 1, maxW: 9, density: 0.9, maxNodes: 9, minNodes: 1 });
    return { graph, source: randInt(rng, 0, graph.n - 1) };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (state) => state.result,
  info,
  legendLabels: { visited: "In the tree", path: "Tree edge", compare: "Candidate edge (in the heap)", current: "Node being added", found: "Cheapest crossing edge", pruned: "Stale (would close a cycle)" },
};

export default algorithm;
