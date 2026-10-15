import type { AlgorithmModule, Highlight } from "../../../engine/types";
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
}

interface Output {
  order: number[];
  dist: (number | null)[];
}

function* generate({ graph, source }: Input) {
  const t = new Tracer<GraphState>();
  const adj = adjacency(graph);
  const base = graphView(graph);
  const dist: (number | null)[] = Array(graph.n).fill(null);
  const parent: (number | null)[] = Array(graph.n).fill(null);
  const queue: number[] = [source];
  const order: number[] = [];
  let head = 0;
  dist[source] = 0;

  const state = (done = false): GraphState => ({
    graph: { ...base, sub: dist.map((d) => (d === null ? null : `d=${d}`)) },
    array: {
      rows: [
        { label: "dist", values: dist.map((d) => (d === null ? "∞" : d)) },
        { label: "order", values: order.length ? order : ["–"], hideIndex: true },
      ],
    },
    result: done ? { order, dist } : undefined,
  });
  // Node colours: processed = visited, waiting in the queue = frontier; tree edges = path.
  const marks = (): Highlight[] => [
    ...parent.flatMap((p, v) => (p === null ? [] : hl("path", ge(p, v)))),
    ...hl("visited", ...order.map(gn)),
    ...hl("frontier", ...queue.slice(head).map(gn)),
  ];
  const aux = (pushed?: boolean) => [
    { label: "queue (front → back)", kind: "queue" as const, items: queue.slice(head), highlight: pushed ? [queue.length - head - 1] : undefined },
  ];

  yield t.step("init", `Start at node ${source}: dist[${source}] = 0 and it is the only node in the queue.`, {
    state: state(),
    vars: { source },
    aux: aux(),
    highlights: marks(),
  });

  while (head < queue.length) {
    const u = queue[head++];
    order.push(u);
    t.count("pops");
    yield t.step("pop", `Dequeue node ${u} (distance ${dist[u]}). Its unseen neighbours will be at distance ${dist[u]! + 1}.`, {
      state: state(),
      vars: { u, "dist[u]": dist[u], "queue size": queue.length - head },
      aux: aux(),
      highlights: [...marks(), ...hl("current", gn(u))],
    });

    if (adj[u].length === 0) {
      yield t.step("scan", `Node ${u} has no ${graph.directed ? "outgoing " : ""}edges.`, {
        state: state(),
        vars: { u },
        aux: aux(),
        highlights: [...marks(), ...hl("current", gn(u))],
      });
    }
    for (const { to: v } of adj[u]) {
      t.count("comparisons");
      if (dist[v] !== null) {
        yield t.step(
          "seen",
          `Edge ${u}${graph.directed ? "→" : "–"}${v}: node ${v} was already discovered (dist ${dist[v]}), skip it.`,
          {
            state: state(),
            vars: { u, v, "dist[v]": dist[v] },
            aux: aux(),
            highlights: [...marks(), ...hl("compare", ge(u, v), gn(v)), ...hl("current", gn(u))],
          },
        );
        continue;
      }
      dist[v] = dist[u]! + 1;
      parent[v] = u;
      queue.push(v);
      t.count("pushes");
      yield t.step("discover", `Edge ${u}${graph.directed ? "→" : "–"}${v}: node ${v} is new. dist[${v}] = ${dist[u]} + 1 = ${dist[v]}, enqueue it.`, {
        state: state(),
        vars: { u, v, "dist[v]": dist[v] },
        aux: aux(true),
        highlights: [...marks(), ...hl("current", gn(u))],
      });
    }
  }

  const unreached = dist.flatMap((d, v) => (d === null ? [v] : []));
  yield t.step(
    "done",
    `Queue empty. Visited ${order.length} node${order.length === 1 ? "" : "s"} in the order ${order.join(", ")}` +
      (unreached.length ? `; unreachable from ${source}: ${unreached.join(", ")}.` : "; every node was reached."),
    {
      state: state(true),
      vars: { visited: order.length },
      aux: aux(),
      highlights: [...marks(), ...hl("pruned", ...unreached.map(gn))],
    },
  );
}

function reference({ graph, source }: Input): Output {
  const adj = adjacency(graph);
  const dist: (number | null)[] = Array(graph.n).fill(null);
  dist[source] = 0;
  const order: number[] = [];
  const queue = [source];
  for (let h = 0; h < queue.length; h++) {
    const u = queue[h];
    order.push(u);
    for (const { to } of adj[u])
      if (dist[to] === null) {
        dist[to] = dist[u]! + 1;
        queue.push(to);
      }
  }
  return { order, dist };
}

const algorithm: AlgorithmModule<Input, GraphState> = {
  ...meta,
  renderer: "graph",
  inputSchema: {
    fields: [graphField("graph", "Graph", { maxNodes: 14 }), sourceField()],
    validate: ({ graph, source }) => sourceCheck(graph, source),
  },
  presets: [
    { name: "Undirected, 8 nodes", input: { graph: SAMPLE_UNDIRECTED, source: 0 } },
    { name: "Directed with a cycle", input: { graph: SAMPLE_DIRECTED, source: 0 } },
    { name: "Edge case: two components", input: { graph: SAMPLE_TWO_PARTS, source: 3 } },
    { name: "Worst depth: a line, start in the middle", input: { graph: lineGraph(9), source: 4 } },
  ],
  randomInput: (size, rng = Math.random) => {
    const graph = randomGraph(rng, size, { directed: rng() < 0.3, density: 0.5, maxNodes: 12, minNodes: 3 });
    return { graph, source: randInt(rng, 0, graph.n - 1) };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (state) => state.result,
  info,
  legendLabels: { frontier: "In the queue", visited: "Dequeued", path: "BFS tree edge", compare: "Already seen", pruned: "Unreachable" },
};

export default algorithm;
