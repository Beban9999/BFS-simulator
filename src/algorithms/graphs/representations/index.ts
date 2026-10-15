import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { ai } from "../../_shared/array";
import { mi } from "../../_shared/matrix";
import { SAMPLE_DIRECTED, SAMPLE_UNDIRECTED, ge, gn, graphField, graphView, randomGraph, type GraphState, type GraphValue } from "../../_shared/graph";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  graph: GraphValue;
}

interface Output {
  adj: number[][];
  matrix: number[][];
}

function* generate({ graph }: Input) {
  const t = new Tracer<GraphState>();
  const { n, edges, directed } = graph;
  const adj: number[][] = Array.from({ length: n }, () => []);
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const base = graphView(graph);
  const sep = directed ? "→" : "–";
  const done = new Set<number>();

  const state = (i: number | null, finished = false): GraphState => ({
    graph: base,
    matrix: { matrix, caption: directed ? "matrix[u][v] = 1 for an edge u → v (row = from)" : "matrix[u][v] = matrix[v][u] = 1" },
    array: {
      rows: [{ label: "edges", values: edges.length ? edges.map(([u, v]) => `${u}${sep}${v}`) : ["–"] }],
      pointers: i === null ? [] : [{ name: "i", index: i }],
    },
    result: finished ? { adj, matrix } : undefined,
  });
  const aux = (hi: number[] = []) => [{ label: "adj (node: neighbours)", kind: "map" as const, items: adj.map((list, u) => [u, `[${list.join(", ")}]`]), highlight: hi }];
  const edgeMarks = () => hl("visited", ...[...done].map((k) => ge(edges[k][0], edges[k][1])));

  yield t.step("init", `Start with ${n} empty adjacency lists and an ${n}×${n} matrix of zeros. The input has ${edges.length} edge${edges.length === 1 ? "" : "s"}.`, {
    state: state(null),
    vars: { n, E: edges.length, directed },
    aux: aux(),
  });

  for (let i = 0; i < edges.length; i++) {
    const [u, v] = edges[i];
    yield t.step("edge", `Edge #${i}: ${u} ${sep} ${v}.`, {
      state: state(i),
      vars: { i, u, v },
      aux: aux(),
      highlights: [...edgeMarks(), ...hl("current", ge(u, v), gn(u), gn(v), ai(i))],
    });
    adj[u].push(v);
    matrix[u][v] = 1;
    t.count("writes", 2);
    yield t.step("add", `Append ${v} to adj[${u}] and set matrix[${u}][${v}] = 1.`, {
      state: state(i),
      vars: { i, u, v, [`adj[${u}]`]: `[${adj[u].join(", ")}]` },
      aux: aux([u]),
      highlights: [...edgeMarks(), ...hl("current", ge(u, v), ai(i)), ...hl("found", mi(u, v), gn(u))],
    });
    if (!directed) {
      adj[v].push(u);
      matrix[v][u] = 1;
      t.count("writes", 2);
      yield t.step("add-back", `Undirected, so store it the other way too: append ${u} to adj[${v}] and set matrix[${v}][${u}] = 1.`, {
        state: state(i),
        vars: { i, u, v, [`adj[${v}]`]: `[${adj[v].join(", ")}]` },
        aux: aux([v]),
        highlights: [...edgeMarks(), ...hl("current", ge(u, v), ai(i)), ...hl("found", mi(v, u), gn(v))],
      });
    }
    done.add(i);
  }

  const entries = adj.reduce((s, l) => s + l.length, 0);
  const deg = adj.map((l) => l.length);
  const maxDeg = Math.max(...deg);
  yield t.step(
    "done",
    `Built. The lists hold ${entries} entr${entries === 1 ? "y" : "ies"}${directed ? "" : ` (2 × ${edges.length} edges)`}; the matrix has ${n * n} cells, ${n * n - entries} of them zero. ` +
      `Highest ${directed ? "out-" : ""}degree: ${maxDeg} (node${deg.filter((d) => d === maxDeg).length > 1 ? "s" : ""} ${deg.flatMap((d, u) => (d === maxDeg ? [u] : [])).join(", ")}).`,
    {
      state: state(null, true),
      vars: { "list entries": entries, "matrix cells": n * n },
      aux: aux(),
      highlights: edgeMarks(),
    },
  );
}

function reference({ graph }: Input): Output {
  const adj: number[][] = Array.from({ length: graph.n }, () => []);
  const matrix = Array.from({ length: graph.n }, () => Array(graph.n).fill(0));
  for (const [u, v] of graph.edges) {
    adj[u].push(v);
    matrix[u][v] = 1;
    if (!graph.directed) {
      adj[v].push(u);
      matrix[v][u] = 1;
    }
  }
  return { adj, matrix };
}

const algorithm: AlgorithmModule<Input, GraphState> = {
  ...meta,
  renderer: "graph",
  inputSchema: { fields: [graphField("graph", "Graph", { maxNodes: 9 })] },
  presets: [
    { name: "Undirected, 8 nodes", input: { graph: SAMPLE_UNDIRECTED } },
    { name: "Directed (matrix not symmetric)", input: { graph: SAMPLE_DIRECTED } },
    {
      name: "Edge case: isolated node",
      input: { graph: { n: 4, directed: false, edges: [[0, 1], [1, 2]], pos: [[0.1, 0.5], [0.4, 0.2], [0.7, 0.5], [0.9, 0.9]] } },
    },
    {
      name: "Dense: complete graph K5",
      input: {
        graph: {
          n: 5,
          directed: false,
          edges: [[0, 1], [0, 2], [0, 3], [0, 4], [1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]],
          pos: [[0.5, 0.06], [0.92, 0.38], [0.76, 0.94], [0.24, 0.94], [0.08, 0.38]],
        },
      },
    },
  ],
  randomInput: (size, rng = Math.random) => ({ graph: randomGraph(rng, size, { directed: rng() < 0.4, density: 0.4, maxNodes: 8, minNodes: 2 }) }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (state) => state.result,
  info,
  legendLabels: { current: "Edge being added", found: "Entry written", visited: "Already stored" },
};

export default algorithm;
