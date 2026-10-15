import type { AlgorithmModule, Frame, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import {
  SAMPLE_DAG,
  SAMPLE_DAG_CYCLE,
  SAMPLE_TWO_PARTS,
  SAMPLE_UNDIRECTED,
  adjacency,
  ge,
  gn,
  graphField,
  graphView,
  randomDagish,
  randomGraph,
  type GraphState,
  type GraphValue,
} from "../../_shared/graph";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  graph: GraphValue;
}

type Step = ReturnType<Tracer<GraphState>["step"]>;

function* generate({ graph }: Input) {
  const t = new Tracer<GraphState>();
  const adj = adjacency(graph);
  const base = graphView(graph);
  const directed = graph.directed;
  const p = directed ? "d" : "u";
  // 0 white, 1 gray (on the path), 2 black (finished). The undirected version only needs "visited"
  // but uses the same bookkeeping so the drawing can show the current path.
  const color: number[] = Array(graph.n).fill(0);
  const parent: (number | null)[] = Array(graph.n).fill(null);
  const path: number[] = [];
  const frames: Frame[] = [];
  let cycle: number[] | null = null;

  const state = (): GraphState => ({ graph: base, result: undefined });
  const marks = (): Highlight[] => [
    ...parent.flatMap((q, v) => (q === null ? [] : hl("path", ge(q, v)))),
    ...hl("visited", ...color.flatMap((c, v) => (c === 2 || (!directed && c === 1) ? [gn(v)] : []))),
    ...hl("active", ...path.map(gn)),
  ];
  const vars = (extra: Record<string, unknown> = {}) => ({ ...extra, path: `[${path.join(", ")}]` });
  const call = (u: number, par: number) => (directed ? `dfs(${u})` : `dfs(${u}, parent=${par})`);

  function* dfs(u: number, par: number): Generator<Step, boolean> {
    color[u] = 1;
    path.push(u);
    frames.push({ call: call(u, par) });
    t.count("calls");
    yield t.step(`${p}-enter`, directed ? `${call(u, par)}: colour ${u} GRAY — it is now on the current path.` : `${call(u, par)}: mark ${u} visited.`, {
      state: state(),
      vars: vars({ u }),
      callStack: frames,
      highlights: [...marks(), ...hl("current", gn(u))],
    });
    for (const { to: v } of adj[u]) {
      t.count("comparisons");
      const edge = `${u}${directed ? "→" : "–"}${v}`;
      if (!directed && v === par) {
        yield t.step("u-parent", `Edge ${edge} just leads back to the parent ${par}; that is the edge we arrived by, not a cycle.`, {
          state: state(),
          vars: vars({ u, v, parent: par }),
          callStack: frames,
          highlights: [...marks(), ...hl("current", gn(u)), ...hl("compare", ge(u, v))],
        });
        continue;
      }
      if ((!directed && color[v] !== 0) || (directed && color[v] === 1)) {
        cycle = path.slice(path.indexOf(v));
        yield t.step(
          `${p}-back`,
          directed
            ? `Edge ${edge} points to ${v}, which is GRAY (still on the path). Back edge → cycle ${[...cycle, v].join(" → ")}.`
            : `Edge ${edge}: ${v} is already visited and is not the parent. Back edge → cycle ${[...cycle, v].join(" – ")}.`,
          {
            state: state(),
            vars: vars({ u, v }),
            callStack: frames,
            highlights: [...marks(), ...hl("mismatch", ...cycle.map(gn), ge(u, v), ...cycle.slice(1).map((x, i) => ge(cycle![i], x)))],
          },
        );
        return true;
      }
      if (directed && color[v] === 2) {
        yield t.step("d-recurse", `Edge ${edge}: ${v} is BLACK — finished in an earlier branch, so every path from it is known to be cycle-free. Skip.`, {
          state: state(),
          vars: vars({ u, v }),
          callStack: frames,
          highlights: [...marks(), ...hl("current", gn(u)), ...hl("compare", ge(u, v), gn(v))],
        });
        continue;
      }
      parent[v] = u;
      yield t.step(`${p}-recurse`, `Edge ${edge}: ${v} is new, explore it.`, {
        state: state(),
        vars: vars({ u, v }),
        callStack: frames,
        highlights: [...marks(), ...hl("current", gn(u)), ...hl("frontier", gn(v))],
      });
      if (yield* dfs(v, u)) return true;
    }
    color[u] = 2;
    path.pop();
    frames.pop();
    yield t.step(
      `${p}-exit`,
      directed ? `All edges out of ${u} are explored without a cycle: colour it BLACK and return.` : `No cycle through ${u}'s remaining edges; return False.`,
      { state: state(), vars: vars({ u }), callStack: frames, highlights: marks() },
    );
    return false;
  }

  for (let s = 0; s < graph.n; s++) {
    if (color[s] !== 0) continue;
    yield t.step(`${p}-start`, s === 0 ? `Node 0 is unvisited: start a DFS there.` : `Node ${s} is still unvisited (a new part of the graph): start another DFS.`, {
      state: state(),
      vars: vars({ s }),
      callStack: frames,
      highlights: [...marks(), ...hl("current", gn(s))],
    });
    if (yield* dfs(s, -1)) {
      const c = cycle!;
      yield t.step(`${p}-start`, `Cycle found: ${[...c, c[0]].join(directed ? " → " : " – ")}. Return True.`, {
        state: { graph: base, result: true },
        vars: vars({ "has cycle": true }),
        callStack: [],
        highlights: [...hl("mismatch", ...c.map(gn), ...c.map((x, i) => ge(x, c[(i + 1) % c.length])))],
      });
      return;
    }
  }
  yield t.step(`${p}-none`, directed ? "Every node is BLACK and no edge ever hit a GRAY node: the graph is acyclic (a DAG)." : "Every node is visited and no back edge appeared: the graph is a forest (no cycles).", {
    state: { graph: base, result: false },
    vars: vars({ "has cycle": false }),
    callStack: [],
    highlights: marks(),
  });
}

function reference({ graph }: Input): boolean {
  // Repeatedly strip nodes that cannot be on a cycle: in-degree 0 (directed) or degree ≤ 1 (undirected).
  const adj = adjacency(graph);
  const deg = Array(graph.n).fill(0);
  if (graph.directed) for (const [, v] of graph.edges) deg[v]++;
  else adj.forEach((l, u) => (deg[u] = l.length));
  const limit = graph.directed ? 0 : 1;
  const removed = Array(graph.n).fill(false);
  const queue = deg.flatMap((d, u) => (d <= limit ? [u] : []));
  queue.forEach((u) => (removed[u] = true));
  for (let h = 0; h < queue.length; h++)
    for (const { to } of adj[queue[h]])
      if (!removed[to] && --deg[to] <= limit) {
        removed[to] = true;
        queue.push(to);
      }
  return queue.length < graph.n;
}

const algorithm: AlgorithmModule<Input, GraphState> = {
  ...meta,
  renderer: "graph",
  inputSchema: { fields: [graphField("graph", "Graph", { maxNodes: 12, help: "Directed graphs use the three-colour DFS, undirected ones the parent check. First line n=<nodes> directed|undirected, then edges like 0-1 or 0>1." })] },
  presets: [
    { name: "Directed: course plan with a cycle", input: { graph: SAMPLE_DAG_CYCLE } },
    { name: "Directed: DAG (diamonds, no cycle)", input: { graph: SAMPLE_DAG } },
    { name: "Undirected with cycles", input: { graph: SAMPLE_UNDIRECTED } },
    {
      name: "Undirected tree (no cycle)",
      input: { graph: { n: 7, directed: false, edges: [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]], pos: [[0.5, 0.06], [0.25, 0.5], [0.75, 0.5], [0.08, 0.94], [0.42, 0.94], [0.58, 0.94], [0.92, 0.94]] } },
    },
    { name: "Cycle only in the second component", input: { graph: { ...SAMPLE_TWO_PARTS, edges: [[0, 1], [1, 2], [3, 4], [4, 5], [5, 6], [6, 3], [6, 7]] } } },
  ],
  randomInput: (size, rng = Math.random) =>
    rng() < 0.5 ? { graph: randomDagish(rng, size, 0.5, 10) } : { graph: randomGraph(rng, size, { density: rng() < 0.5 ? 0 : 0.3, maxNodes: 10, minNodes: 2 }) },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (state) => state.result,
  info,
  legendLabels: { active: "On the path (GRAY)", visited: "Finished (BLACK) / visited", path: "DFS tree edge", compare: "Skipped edge", mismatch: "Cycle", frontier: "Next to explore" },
};

export default algorithm;
