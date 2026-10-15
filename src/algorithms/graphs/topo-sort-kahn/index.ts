import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { SAMPLE_DAG, SAMPLE_DAG_CYCLE, adjacency, ge, gn, graphField, gridPos, graphView, randomDagish, type GraphState, type GraphValue } from "../../_shared/graph";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  graph: GraphValue;
}

function* generate({ graph }: Input) {
  const t = new Tracer<GraphState>();
  const adj = adjacency(graph);
  const base = graphView(graph);
  const n = graph.n;
  const indeg: number[] = Array(n).fill(0);
  const removed = new Set<string>();
  const order: number[] = [];
  const queue: number[] = [];
  let head = 0;

  const state = (done: number[] | null = null): GraphState => ({
    graph: { ...base, sub: indeg.map((d, v) => (order.includes(v) ? null : `in ${d}`)) },
    array: {
      rows: [
        { label: "indeg", values: indeg },
        { label: "order", values: order.length ? order : ["–"], hideIndex: true },
      ],
    },
    result: done ?? undefined,
  });
  const marks = (): Highlight[] => [
    ...hl("pruned", ...[...removed].map((k) => `ge:${k}`)),
    ...hl("visited", ...order.map(gn)),
    ...hl("frontier", ...queue.slice(head).map(gn)),
  ];
  const aux = (pushed = false) => [{ label: "queue (in-degree 0)", kind: "queue" as const, items: queue.slice(head), highlight: pushed ? [queue.length - head - 1] : undefined }];

  for (let u = 0; u < n; u++) {
    if (!adj[u].length) continue;
    for (const { to } of adj[u]) indeg[to]++;
    t.count("writes", adj[u].length);
    yield t.step("count", `Edges out of ${u} go to ${adj[u].map((a) => a.to).join(", ")}: add 1 to each one's in-degree.`, {
      state: state(),
      vars: { u },
      highlights: [...hl("current", gn(u)), ...hl("compare", ...adj[u].map((a) => ge(u, a.to)))],
    });
  }
  for (let u = 0; u < n; u++) if (indeg[u] === 0) queue.push(u);
  yield t.step(
    "seed",
    queue.length
      ? `Nodes with in-degree 0 have no prerequisites: ${queue.join(", ")}. They start in the queue.`
      : "No node has in-degree 0 — every node has a prerequisite, so the graph must contain a cycle.",
    { state: state(), vars: { ready: queue.length }, aux: aux(), highlights: marks() },
  );

  while (head < queue.length) {
    const u = queue[head++];
    order.push(u);
    t.count("pops");
    yield t.step("pop", `Take ${u} from the queue and append it to the order (position ${order.length}).`, {
      state: state(),
      vars: { u, placed: order.length },
      aux: aux(),
      highlights: [...marks(), ...hl("current", gn(u))],
    });
    for (const { to: v } of adj[u]) {
      indeg[v]--;
      removed.add(`${u}-${v}`);
      t.count("comparisons");
      if (indeg[v] === 0) {
        queue.push(v);
        yield t.step("ready", `Remove edge ${u}→${v}: in-degree of ${v} drops to 0, so all its prerequisites are done. Enqueue ${v}.`, {
          state: state(),
          vars: { u, v, [`indeg[${v}]`]: 0 },
          aux: aux(true),
          highlights: [...marks(), ...hl("current", gn(u)), ...hl("found", gn(v))],
        });
      } else {
        yield t.step("relax", `Remove edge ${u}→${v}: in-degree of ${v} drops to ${indeg[v]}; it still waits for ${indeg[v]} more.`, {
          state: state(),
          vars: { u, v, [`indeg[${v}]`]: indeg[v] },
          aux: aux(),
          highlights: [...marks(), ...hl("current", gn(u)), ...hl("compare", gn(v))],
        });
      }
    }
  }

  if (order.length < n) {
    const stuck = indeg.flatMap((d, v) => (d > 0 ? [v] : []));
    yield t.step("check", `The queue is empty but only ${order.length} of ${n} nodes were placed. Nodes ${stuck.join(", ")} still have incoming edges from each other — a cycle. Return [].`, {
      state: state([]),
      vars: { placed: order.length, n },
      aux: aux(),
      highlights: [...marks(), ...hl("mismatch", ...stuck.map(gn))],
    });
    return;
  }
  yield t.step("done", `All ${n} nodes placed: ${order.join(" → ")}. Every edge points forward in this order.`, {
    state: state(order),
    vars: { placed: n },
    aux: aux(),
    highlights: marks(),
  });
}

function reference({ graph }: Input): number[] {
  const adj = adjacency(graph);
  const indeg = Array(graph.n).fill(0);
  for (const [, v] of graph.edges) indeg[v]++;
  const queue = indeg.flatMap((d, u) => (d === 0 ? [u] : []));
  for (let h = 0; h < queue.length; h++) for (const { to } of adj[queue[h]]) if (--indeg[to] === 0) queue.push(to);
  return queue.length === graph.n ? queue : [];
}

const algorithm: AlgorithmModule<Input, GraphState> = {
  ...meta,
  renderer: "graph",
  inputSchema: { fields: [graphField("graph", "Graph (u>v: u before v)", { directed: true, maxNodes: 12 })] },
  presets: [
    { name: "Course plan (DAG)", input: { graph: SAMPLE_DAG } },
    { name: "Edge case: cycle 3→4→6→3", input: { graph: SAMPLE_DAG_CYCLE } },
    { name: "Edge case: no edges (any order)", input: { graph: { n: 4, directed: true, edges: [], pos: gridPos([[0, 0], [1, 0], [2, 0], [3, 0]]) } } },
    {
      name: "Chain plus shortcuts",
      input: { graph: { n: 6, directed: true, edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [0, 3], [2, 5]], pos: gridPos([[0, 1], [1, 0], [2, 1], [3, 0], [4, 1], [5, 0]]) } },
    },
  ],
  randomInput: (size, rng = Math.random) => ({ graph: randomDagish(rng, size, 0.25, 10) }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (state) => state.result,
  info,
  legendLabels: { frontier: "Ready (in-degree 0)", visited: "Placed in the order", pruned: "Removed edge", current: "Node being placed", compare: "Still waiting", found: "Just became ready", mismatch: "Stuck on a cycle" },
};

export default algorithm;
