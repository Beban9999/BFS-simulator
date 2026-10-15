import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { SAMPLE_TWO_PARTS, SAMPLE_UNDIRECTED, adjacency, ge, gn, graphField, gridPos, graphView, randomGraph, type GraphState, type GraphValue } from "../../_shared/graph";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  graph: GraphValue;
}

const SIDE = ["A", "B"];

function* generate({ graph }: Input) {
  const t = new Tracer<GraphState>();
  const adj = adjacency(graph);
  const base = graphView(graph);
  const n = graph.n;
  const color: number[] = Array(n).fill(-1);
  const parent: (number | null)[] = Array(n).fill(null);
  const checked = new Set<string>();
  let queue: number[] = [];
  let head = 0;

  const state = (result?: boolean): GraphState => ({
    graph: { ...base, groups: color.map((c) => (c < 0 ? null : c)), sub: color.map((c) => (c < 0 ? null : SIDE[c])) },
    caption: "Blue nodes are side A (colour 0), orange nodes side B (colour 1).",
    result,
  });
  const marks = (): Highlight[] => [...hl("path", ...parent.flatMap((p, v) => (p === null ? [] : [ge(p, v)]))), ...hl("visited", ...[...checked].map((k) => `ge:${k}`))];
  const aux = () => [{ label: "queue", kind: "queue" as const, items: queue.slice(head) }];
  const chain = (v: number) => {
    const out = [v];
    while (parent[out[out.length - 1]] !== null) out.push(parent[out[out.length - 1]]!);
    return out;
  };

  for (let s = 0; s < n; s++) {
    if (color[s] !== -1) continue;
    color[s] = 0;
    queue = [s];
    head = 0;
    yield t.step("start", s === 0 ? `Node 0 is uncoloured: give it side A and start a BFS.` : `Node ${s} is in a new, uncoloured component: give it side A and BFS again.`, {
      state: state(),
      vars: { s },
      aux: aux(),
      highlights: [...marks(), ...hl("current", gn(s))],
    });
    while (head < queue.length) {
      const u = queue[head++];
      t.count("pops");
      yield t.step("pop", `Dequeue ${u} (side ${SIDE[color[u]]}). Its neighbours must all be on side ${SIDE[1 - color[u]]}.`, {
        state: state(),
        vars: { u, "color[u]": color[u] },
        aux: aux(),
        highlights: [...marks(), ...hl("current", gn(u))],
      });
      for (const { to: v } of adj[u]) {
        t.count("comparisons");
        if (color[v] === -1) {
          color[v] = 1 - color[u];
          parent[v] = u;
          queue.push(v);
          yield t.step("paint", `${v} is uncoloured: put it on side ${SIDE[color[v]]} (opposite of ${u}) and enqueue it.`, {
            state: state(),
            vars: { u, v, "color[v]": color[v] },
            aux: aux(),
            highlights: [...marks(), ...hl("current", gn(u)), ...hl("frontier", gn(v))],
          });
        } else if (color[v] === color[u]) {
          // The two BFS-tree paths up to the lowest common ancestor plus edge u–v form an odd cycle.
          const a = chain(u);
          const b = chain(v);
          const lca = a.find((x) => b.includes(x))!;
          const cyc = [...a.slice(0, a.indexOf(lca) + 1), ...b.slice(0, b.indexOf(lca)).reverse()];
          yield t.step("conflict", `Edge ${u}–${v} joins two side-${SIDE[color[u]]} nodes. With the tree paths it closes the odd cycle ${[...cyc, cyc[0]].join(" – ")} (${cyc.length} edges): not bipartite.`, {
            state: state(false),
            vars: { u, v, "cycle length": cyc.length },
            aux: aux(),
            highlights: [...marks(), ...hl("mismatch", ...cyc.map(gn), ...cyc.map((x, i) => ge(x, cyc[(i + 1) % cyc.length])))],
          });
          return;
        } else {
          const key = `${Math.min(u, v)}-${Math.max(u, v)}`;
          const tree = parent[v] === u || parent[u] === v;
          const first = !tree && !checked.has(key);
          if (!tree) checked.add(key);
          if (first)
            yield t.step("conflict", `${v} is already on side ${SIDE[color[v]]}, different from ${u}: edge ${u}–${v} is fine.`, {
              state: state(),
              vars: { u, v },
              aux: aux(),
              highlights: [...marks(), ...hl("current", gn(u)), ...hl("match", ge(u, v))],
            });
        }
      }
    }
  }
  yield t.step("done", `Every edge joins side A to side B: bipartite. Side A = {${color.flatMap((c, v) => (c === 0 ? [v] : [])).join(", ")}}, side B = {${color.flatMap((c, v) => (c === 1 ? [v] : [])).join(", ")}}.`, {
    state: state(true),
    vars: { bipartite: true },
    aux: aux(),
    highlights: marks(),
  });
}

function reference({ graph }: Input): boolean {
  // A graph is bipartite iff it has no odd cycle: check with a DFS parity colouring.
  const adj = adjacency(graph);
  const side = Array(graph.n).fill(-1);
  const go = (u: number, c: number): boolean => {
    side[u] = c;
    return adj[u].every(({ to }) => (side[to] === -1 ? go(to, c ^ 1) : side[to] !== c));
  };
  return side.every((_, u) => side[u] !== -1 || go(u, 0));
}

const algorithm: AlgorithmModule<Input, GraphState> = {
  ...meta,
  renderer: "graph",
  inputSchema: { fields: [graphField("graph", "Graph", { directed: false, maxNodes: 12 })] },
  presets: [
    {
      name: "Bipartite: 3×3 grid of nodes",
      input: {
        graph: {
          n: 9,
          directed: false,
          edges: [[0, 1], [1, 2], [3, 4], [4, 5], [6, 7], [7, 8], [0, 3], [3, 6], [1, 4], [4, 7], [2, 5], [5, 8]],
          pos: gridPos([[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [1, 2], [2, 2]]),
        },
      },
    },
    { name: "Odd cycle (triangle 0-1-2)", input: { graph: SAMPLE_UNDIRECTED } },
    {
      name: "Even cycle (hexagon)",
      input: { graph: { n: 6, directed: false, edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]], pos: gridPos([[1, 0], [2, 1], [2, 2], [1, 3], [0, 2], [0, 1]]) } },
    },
    { name: "Two components, conflict in the second", input: { graph: { ...SAMPLE_TWO_PARTS, edges: [[0, 1], [1, 2], [3, 4], [4, 5], [5, 3], [6, 7]] } } },
  ],
  randomInput: (size, rng = Math.random) => ({ graph: randomGraph(rng, size, { density: rng() < 0.5 ? 0.1 : 0.4, maxNodes: 10, minNodes: 2, connected: rng() < 0.7 }) }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (state) => state.result,
  info,
  legendLabels: { path: "BFS tree edge", visited: "Checked edge", match: "Edge between sides", frontier: "Just coloured", mismatch: "Odd cycle" },
};

export default algorithm;
