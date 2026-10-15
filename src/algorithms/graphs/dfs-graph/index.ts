import type { AlgorithmModule, Frame, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import {
  SAMPLE_DIRECTED,
  SAMPLE_TWO_PARTS,
  SAMPLE_UNDIRECTED,
  adjacency,
  ge,
  gn,
  graphField,
  graphView,
  lineGraph,
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
  mode: "recursive" | "iterative";
}

function* generate({ graph, source, mode }: Input) {
  const t = new Tracer<GraphState>();
  const adj = adjacency(graph);
  const base = graphView(graph);
  const visited: boolean[] = Array(graph.n).fill(false);
  const parent: (number | null)[] = Array(graph.n).fill(null);
  const order: number[] = [];
  const arrow = graph.directed ? "→" : "–";

  const state = (done = false): GraphState => ({
    graph: { ...base, sub: Array.from({ length: graph.n }, (_, v) => (visited[v] ? `#${order.indexOf(v) + 1}` : null)) },
    array: { rows: [{ label: "order", values: order.length ? order : ["–"], hideIndex: true }] },
    result: done ? order : undefined,
  });
  const treeEdges = (): Highlight[] => parent.flatMap((p, v) => (p === null ? [] : hl("path", ge(p, v))));

  if (mode === "recursive") {
    const frames: Frame[] = [];
    const onStack: number[] = [];
    const marks = (): Highlight[] => [...treeEdges(), ...hl("visited", ...order.map(gn)), ...hl("active", ...onStack.map(gn))];

    function* visit(u: number): Generator<ReturnType<typeof t.step>> {
      visited[u] = true;
      order.push(u);
      onStack.push(u);
      frames.push({ call: `visit(${u})` });
      t.count("calls");
      yield t.step(
        "r-enter",
        parent[u] === null ? `visit(${u}): mark the start node visited (#1 in the order).` : `visit(${u}): mark ${u} visited (#${order.length}). Call stack depth is now ${frames.length}.`,
        { state: state(), vars: { u, depth: frames.length }, callStack: frames, highlights: [...marks(), ...hl("current", gn(u))] },
      );
      for (const { to: v } of adj[u]) {
        t.count("comparisons");
        if (visited[v]) {
          yield t.step("r-seen", `Edge ${u}${arrow}${v}: ${v} is already visited${onStack.includes(v) ? " (it is on the call stack)" : ""}, skip.`, {
            state: state(),
            vars: { u, v },
            callStack: frames,
            highlights: [...marks(), ...hl("compare", ge(u, v), gn(v)), ...hl("current", gn(u))],
          });
          continue;
        }
        parent[v] = u;
        yield t.step("r-recurse", `Edge ${u}${arrow}${v}: ${v} is new, go deeper with visit(${v}).`, {
          state: state(),
          vars: { u, v },
          callStack: frames,
          highlights: [...marks(), ...hl("current", gn(u)), ...hl("frontier", gn(v))],
        });
        yield* visit(v);
      }
      frames.pop();
      onStack.pop();
      const back = onStack[onStack.length - 1];
      yield t.step(
        "r-scan",
        `All edges of ${u} are done, so visit(${u}) returns` + (back === undefined ? "." : ` and the search backs up to ${back}.`),
        { state: state(), vars: { u }, callStack: frames, highlights: [...marks(), ...hl("current", gn(back ?? u))] },
      );
    }

    yield t.step("r-start", `Call visit(${source}).`, { state: state(), vars: { source }, highlights: hl("current", gn(source)) });
    yield* visit(source);
    yield t.step("r-done", `Done: DFS order ${order.join(", ")}` + (order.length < graph.n ? ` (${graph.n - order.length} node${graph.n - order.length === 1 ? "" : "s"} unreachable).` : "."), {
      state: state(true),
      vars: { visited: order.length },
      highlights: [...treeEdges(), ...hl("visited", ...order.map(gn)), ...hl("pruned", ...visited.flatMap((x, v) => (x ? [] : [gn(v)])))],
    });
    return;
  }

  // Iterative: stack of [node, parent]; a node may be pushed several times and is skipped when stale.
  const stack: [number, number | null][] = [[source, null]];
  const marks = (): Highlight[] => [...treeEdges(), ...hl("visited", ...order.map(gn)), ...hl("frontier", ...stack.filter(([v]) => !visited[v]).map(([v]) => gn(v)))];
  const aux = (pushed = 0) => [
    {
      label: "stack (top first)",
      kind: "stack" as const,
      items: stack.map(([v]) => v).reverse(),
      highlight: pushed ? Array.from({ length: pushed }, (_, i) => i) : undefined,
    },
  ];
  yield t.step("i-init", `Push the start node ${source}.`, { state: state(), vars: { source }, aux: aux(1), highlights: marks() });
  while (stack.length) {
    const [u, from] = stack.pop()!;
    t.count("pops");
    if (visited[u]) {
      yield t.step("i-skip", `Pop ${u}: it was visited after being pushed, so this copy is stale. Skip it.`, {
        state: state(),
        vars: { u, "stack size": stack.length },
        aux: aux(),
        highlights: [...marks(), ...hl("compare", gn(u))],
      });
      continue;
    }
    yield t.step("i-pop", `Pop ${u} from the top of the stack.`, {
      state: state(),
      vars: { u, "stack size": stack.length },
      aux: aux(),
      highlights: [...marks(), ...hl("current", gn(u))],
    });
    visited[u] = true;
    parent[u] = from;
    order.push(u);
    yield t.step("i-visit", `Mark ${u} visited (#${order.length})` + (from === null ? "." : `, reached from ${from}.`), {
      state: state(),
      vars: { u },
      aux: aux(),
      highlights: [...marks(), ...hl("current", gn(u))],
    });
    const fresh = adj[u].filter(({ to }) => !visited[to]).map(({ to }) => to);
    for (let k = fresh.length - 1; k >= 0; k--) {
      stack.push([fresh[k], u]);
      t.count("pushes");
    }
    if (fresh.length) {
      yield t.step("i-push", `Push the unvisited neighbours ${fresh.join(", ")} in reverse, so ${fresh[0]} ends up on top and is explored first.`, {
        state: state(),
        vars: { u, pushed: fresh.length },
        aux: aux(fresh.length),
        highlights: [...marks(), ...hl("current", gn(u))],
      });
    }
  }
  yield t.step("i-done", `Stack empty. DFS order ${order.join(", ")}` + (order.length < graph.n ? ` (${graph.n - order.length} node${graph.n - order.length === 1 ? "" : "s"} unreachable).` : "."), {
    state: state(true),
    vars: { visited: order.length },
    aux: aux(),
    highlights: [...treeEdges(), ...hl("visited", ...order.map(gn)), ...hl("pruned", ...visited.flatMap((x, v) => (x ? [] : [gn(v)])))],
  });
}

function reference({ graph, source }: Input): number[] {
  const adj = adjacency(graph);
  const seen = new Set<number>();
  const order: number[] = [];
  const visit = (u: number) => {
    seen.add(u);
    order.push(u);
    for (const { to } of adj[u]) if (!seen.has(to)) visit(to);
  };
  visit(source);
  return order;
}

const algorithm: AlgorithmModule<Input, GraphState> = {
  ...meta,
  renderer: "graph",
  inputSchema: {
    fields: [
      graphField("graph", "Graph", { maxNodes: 14 }),
      sourceField(),
      {
        key: "mode",
        label: "Version",
        kind: "select",
        options: [
          { value: "recursive", label: "Recursive (call stack)" },
          { value: "iterative", label: "Iterative (explicit stack)" },
        ],
      },
    ],
    validate: ({ graph, source }) => sourceCheck(graph, source),
  },
  presets: [
    { name: "Recursive, undirected", input: { graph: SAMPLE_UNDIRECTED, source: 0, mode: "recursive" } },
    { name: "Iterative, same graph", input: { graph: SAMPLE_UNDIRECTED, source: 0, mode: "iterative" } },
    { name: "Directed with a cycle", input: { graph: SAMPLE_DIRECTED, source: 0, mode: "recursive" } },
    { name: "Edge case: two components", input: { graph: SAMPLE_TWO_PARTS, source: 0, mode: "iterative" } },
    { name: "Worst depth: a line", input: { graph: lineGraph(9), source: 0, mode: "recursive" } },
  ],
  randomInput: (size, rng = Math.random) => {
    const graph = randomGraph(rng, size, { directed: rng() < 0.3, density: 0.5, maxNodes: 12, minNodes: 3 });
    return { graph, source: randInt(rng, 0, graph.n - 1), mode: rng() < 0.5 ? "recursive" : "iterative" };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (state) => state.result,
  info,
  legendLabels: { active: "On the call stack", frontier: "On the stack (unvisited)", path: "DFS tree edge", compare: "Already visited", pruned: "Unreachable" },
};

export default algorithm;
