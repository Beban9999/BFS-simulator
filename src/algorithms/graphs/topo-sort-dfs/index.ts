import type { AlgorithmModule, Frame, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { SAMPLE_DAG, SAMPLE_DAG_CYCLE, adjacency, ge, gn, graphField, gridPos, graphView, randomDagish, type GraphState, type GraphValue } from "../../_shared/graph";
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
  const n = graph.n;
  const st: number[] = Array(n).fill(0);
  const finished: number[] = [];
  const path: number[] = [];
  const frames: Frame[] = [];
  const parent: (number | null)[] = Array(n).fill(null);

  const state = (result?: number[]): GraphState => ({
    graph: { ...base, sub: Array.from({ length: n }, (_, v) => (st[v] === 2 ? `f${finished.indexOf(v) + 1}` : null)) },
    array: { rows: [{ label: "finished", values: finished.length ? finished : ["–"], hideIndex: true }] },
    result,
  });
  const marks = (): Highlight[] => [
    ...parent.flatMap((p, v) => (p === null ? [] : hl("path", ge(p, v)))),
    ...hl("visited", ...finished.map(gn)),
    ...hl("active", ...path.map(gn)),
  ];

  function* dfs(u: number): Generator<Step, boolean> {
    st[u] = 1;
    path.push(u);
    frames.push({ call: `dfs(${u})` });
    t.count("calls");
    yield t.step("enter", `dfs(${u}): ${u} goes on the current path (state 1).`, {
      state: state(),
      vars: { u },
      callStack: frames,
      highlights: [...marks(), ...hl("current", gn(u))],
    });
    for (const { to: v } of adj[u]) {
      t.count("comparisons");
      if (st[v] === 1) {
        const cyc = path.slice(path.indexOf(v));
        yield t.step("cycle", `Edge ${u}→${v} leads back to ${v}, which is still on the path: cycle ${[...cyc, v].join(" → ")}. No topological order exists.`, {
          state: state(),
          vars: { u, v },
          callStack: frames,
          highlights: [...marks(), ...hl("mismatch", ...cyc.map(gn), ge(u, v), ...cyc.slice(1).map((x, i) => ge(cyc[i], x)))],
        });
        return false;
      }
      if (st[v] === 2) {
        yield t.step("recurse", `Edge ${u}→${v}: ${v} already finished (#${finished.indexOf(v) + 1}), so it will end up after ${u} anyway. Skip.`, {
          state: state(),
          vars: { u, v },
          callStack: frames,
          highlights: [...marks(), ...hl("current", gn(u)), ...hl("compare", ge(u, v), gn(v))],
        });
        continue;
      }
      parent[v] = u;
      yield t.step("recurse", `Edge ${u}→${v}: ${v} is new, explore it first — it has to finish before ${u}.`, {
        state: state(),
        vars: { u, v },
        callStack: frames,
        highlights: [...marks(), ...hl("current", gn(u)), ...hl("frontier", gn(v))],
      });
      if (!(yield* dfs(v))) return false;
    }
    st[u] = 2;
    path.pop();
    finished.push(u);
    frames.pop();
    yield t.step("finish", `Everything reachable from ${u} has finished, so ${u} finishes now (#${finished.length}).`, {
      state: state(),
      vars: { u, finished: finished.length },
      callStack: frames,
      highlights: [...marks(), ...hl("found", gn(u))],
    });
    return true;
  }

  for (let u = 0; u < n; u++) {
    if (st[u] !== 0) continue;
    yield t.step("start", `Node ${u} is unvisited: start a DFS there.`, { state: state(), vars: { u }, callStack: [], highlights: [...marks(), ...hl("current", gn(u))] });
    if (!(yield* dfs(u))) {
      yield t.step("start", "The DFS hit a cycle, so return [].", { state: state([]), vars: { u }, callStack: [], highlights: marks() });
      return;
    }
  }
  const order = finished.slice().reverse();
  yield t.step("done", `Reverse the finish list: ${order.join(" → ")}. Every edge points from an earlier node to a later one.`, {
    state: state(order),
    vars: { placed: n },
    callStack: [],
    highlights: marks(),
  });
}

function reference({ graph }: Input): number[] {
  const adj = adjacency(graph);
  const st = Array(graph.n).fill(0);
  const out: number[] = [];
  const dfs = (u: number): boolean => {
    st[u] = 1;
    for (const { to } of adj[u]) if (st[to] === 1 || (st[to] === 0 && !dfs(to))) return false;
    st[u] = 2;
    out.push(u);
    return true;
  };
  for (let u = 0; u < graph.n; u++) if (st[u] === 0 && !dfs(u)) return [];
  return out.reverse();
}

const algorithm: AlgorithmModule<Input, GraphState> = {
  ...meta,
  renderer: "graph",
  inputSchema: { fields: [graphField("graph", "Graph (u>v: u before v)", { directed: true, maxNodes: 12 })] },
  presets: [
    { name: "Course plan (DAG)", input: { graph: SAMPLE_DAG } },
    { name: "Edge case: cycle 3→4→6→3", input: { graph: SAMPLE_DAG_CYCLE } },
    {
      name: "Start in the middle (cross edges)",
      input: { graph: { n: 6, directed: true, edges: [[2, 3], [3, 5], [0, 1], [1, 2], [1, 4], [4, 3]], pos: gridPos([[0, 1], [1, 1], [2, 0], [3, 1], [2, 2], [4, 1]]) } },
    },
    { name: "Edge case: isolated nodes", input: { graph: { n: 4, directed: true, edges: [[2, 0]], pos: gridPos([[1, 0], [0, 1], [0, 0], [1, 1]]) } } },
  ],
  randomInput: (size, rng = Math.random) => ({ graph: randomDagish(rng, size, 0.25, 10) }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (state) => state.result,
  info,
  legendLabels: { active: "On the path", visited: "Finished", path: "DFS tree edge", compare: "Edge to a finished node", frontier: "Next to explore", found: "Just finished", mismatch: "Cycle" },
};

export default algorithm;
