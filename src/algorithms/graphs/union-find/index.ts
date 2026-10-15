import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { ai } from "../../_shared/array";
import { dsuForest, dsuGroups, ge, gn, graphField, gridPos, graphView, randomGraph, te, tn, type Edge, type GraphState, type GraphValue } from "../../_shared/graph";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  graph: GraphValue;
}

interface Output {
  components: number;
  redundant: Edge[];
}

function* generate({ graph }: Input) {
  const t = new Tracer<GraphState>();
  const n = graph.n;
  const base = graphView(graph);
  const parent = Array.from({ length: n }, (_, i) => i);
  const rank: number[] = Array(n).fill(0);
  const kept: Edge[] = [];
  const redundant: Edge[] = [];
  let components = n;

  const rootOf = (x: number) => {
    while (parent[x] !== x) x = parent[x];
    return x;
  };
  const state = (result?: Output): GraphState => ({
    graph: { ...base, groups: dsuGroups(parent.map((_, v) => rootOf(v))) },
    trees: dsuForest(parent, rank),
    array: { rows: [{ label: "parent", values: parent.slice() }, { label: "rank", values: rank.slice() }] },
    result,
  });
  const marks = (): Highlight[] => [...hl("path", ...kept.map(([u, v]) => ge(u, v))), ...hl("pruned", ...redundant.map(([u, v]) => ge(u, v)))];
  const vars = (extra: Record<string, unknown> = {}) => ({ ...extra, components });

  function* find(x: number, edge: Highlight[]) {
    const path = [x];
    while (parent[path[path.length - 1]] !== path[path.length - 1]) path.push(parent[path[path.length - 1]]);
    const root = path[path.length - 1];
    t.count("accesses", path.length);
    yield t.step(
      "find",
      path.length === 1 ? `find(${x}): ${x} is its own parent, so it is a root.` : `find(${x}): follow parents ${path.join(" → ")}; the root is ${root}.`,
      {
        state: state(),
        vars: vars({ x, root }),
        highlights: [...marks(), ...edge, ...hl("compare", ...path.map(tn), ...path.slice(1).map((p, i) => te(p, path[i])), ...path.map((p) => ai(p, 0))), ...hl("found", tn(root))],
      },
    );
    const moved = path.slice(0, -2);
    if (moved.length) {
      for (const v of moved) parent[v] = root;
      t.count("writes", moved.length);
      yield t.step("compress", `Path compression: point ${moved.join(", ")} straight at the root ${root}. Later finds from ${moved.length === 1 ? "it" : "them"} take one hop.`, {
        state: state(),
        vars: vars({ x, root }),
        highlights: [...marks(), ...edge, ...hl("swap", ...moved.map(tn), ...moved.map((v) => te(root, v)), ...moved.map((v) => ai(v, 0)))],
      });
    }
    return root;
  }

  yield t.step("init", `Start with ${n} singleton sets: every node is its own parent and root, rank 0. Components = ${n}.`, {
    state: state(),
    vars: vars(),
  });

  for (const [a, b] of graph.edges) {
    const edge = hl("current", ge(a, b), gn(a), gn(b));
    yield t.step("edge", `Edge ${a}–${b}: union(${a}, ${b}).`, { state: state(), vars: vars({ a, b }), highlights: [...marks(), ...edge] });
    const ra = yield* find(a, edge);
    const rb = yield* find(b, edge);
    t.count("comparisons");
    if (ra === rb) {
      redundant.push([a, b]);
      yield t.step("same", `Both roots are ${ra}: ${a} and ${b} are already connected. Edge ${a}–${b} is redundant (it would close a cycle).`, {
        state: state(),
        vars: vars({ a, b, ra, rb }),
        highlights: [...marks(), ...hl("mismatch", ge(a, b)), ...hl("found", tn(ra))],
      });
      continue;
    }
    let big = ra;
    let small = rb;
    if (rank[ra] < rank[rb]) [big, small] = [rb, ra];
    yield t.step(
      "rank",
      rank[ra] === rank[rb] ? `Roots ${ra} and ${rb} both have rank ${rank[ra]}: keep ${big} as the new root.` : `rank[${ra}] = ${rank[ra]}, rank[${rb}] = ${rank[rb]}: hang the shorter tree (root ${small}) under ${big}.`,
      { state: state(), vars: vars({ a, b, ra, rb }), highlights: [...marks(), ...edge, ...hl("found", tn(big)), ...hl("compare", tn(small))] },
    );
    parent[small] = big;
    kept.push([a, b]);
    components--;
    t.count("writes");
    const grew = rank[big] === rank[small];
    yield t.step("link", `parent[${small}] = ${big}. Two sets became one: components = ${components}.`, {
      state: state(),
      vars: vars({ a, b }),
      highlights: [...marks(), ...hl("swap", te(big, small), ai(small, 0)), ...hl("found", tn(big))],
    });
    if (grew) {
      rank[big]++;
      yield t.step("grow", `The two trees had equal rank, so the merged tree may be one level taller: rank[${big}] = ${rank[big]}.`, {
        state: state(),
        vars: vars({ root: big, rank: rank[big] }),
        highlights: [...marks(), ...hl("found", tn(big), ai(big, 1))],
      });
    }
  }

  yield t.step(
    "done",
    `All edges processed: ${components} component${components === 1 ? "" : "s"}` + (redundant.length ? `; redundant edge${redundant.length === 1 ? "" : "s"}: ${redundant.map(([u, v]) => `${u}–${v}`).join(", ")}.` : "; no edge was redundant (the graph is a forest)."),
    { state: state({ components, redundant }), vars: vars(), highlights: marks() },
  );
}

function reference({ graph }: Input): Output {
  // Plain relabelling: each node stores a component label; merging relabels one whole side.
  const label = Array.from({ length: graph.n }, (_, i) => i);
  const redundant: Edge[] = [];
  let components = graph.n;
  for (const [a, b] of graph.edges) {
    if (label[a] === label[b]) {
      redundant.push([a, b]);
      continue;
    }
    const old = label[b];
    for (let i = 0; i < graph.n; i++) if (label[i] === old) label[i] = label[a];
    components--;
  }
  return { components, redundant };
}

const algorithm: AlgorithmModule<Input, GraphState> = {
  ...meta,
  renderer: "graph",
  inputSchema: { fields: [graphField("graph", "Graph (edges = union calls, in order)", { directed: false, maxNodes: 12 })] },
  presets: [
    {
      name: "Two groups, then a bridge and a redundant edge",
      input: {
        graph: {
          n: 8,
          directed: false,
          edges: [[0, 1], [2, 3], [1, 3], [4, 5], [6, 7], [5, 7], [0, 2], [3, 6], [4, 6]],
          pos: gridPos([[0, 0], [1, 0], [0, 1], [1, 1], [3, 0], [4, 0], [3, 1], [4, 1]]),
        },
      },
    },
    {
      name: "LeetCode 684: redundant connection",
      input: { graph: { n: 5, directed: false, edges: [[0, 1], [1, 2], [2, 3], [0, 3], [0, 4]], pos: gridPos([[0, 0], [1, 0], [1, 1], [0, 1], [-1, 0]]) } },
    },
    {
      name: "Chain of unions: rank keeps the tree flat",
      input: {
        graph: {
          n: 7,
          directed: false,
          edges: [[5, 6], [4, 5], [3, 4], [2, 3], [1, 2], [0, 1], [6, 0]],
          pos: gridPos([[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0]]),
        },
      },
    },
    { name: "Edge case: no edges", input: { graph: { n: 4, directed: false, edges: [], pos: gridPos([[0, 0], [1, 0], [0, 1], [1, 1]]) } } },
  ],
  randomInput: (size, rng = Math.random) => ({ graph: randomGraph(rng, size, { connected: rng() < 0.4, density: 0.7, maxNodes: 10, minNodes: 2 }) }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (state) => state.result,
  info,
  legendLabels: { current: "Edge being processed", compare: "find path", found: "Root", swap: "Re-pointed", path: "Edge that merged two sets", pruned: "Redundant edge", mismatch: "Redundant (just found)" },
};

export default algorithm;
