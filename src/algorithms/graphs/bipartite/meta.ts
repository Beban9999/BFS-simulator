import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "bipartite",
  title: "Bipartite Check (2-colouring)",
  category: "graphs",
  subcategory: "Cycles & ordering",
  difficulty: "core",
  order: 4,
  summary: "BFS colours each new node the opposite colour of its parent; an edge between two same-coloured nodes proves an odd cycle.",
  keywords: ["bipartite", "two colouring", "2-coloring", "odd cycle", "bfs colouring", "possible bipartition"],
  problems: [
    { id: 785, title: "Is Graph Bipartite?", difficulty: "Medium", slug: "is-graph-bipartite", note: "This page: BFS 2-colouring from every uncoloured node." },
    { id: 886, title: "Possible Bipartition", difficulty: "Medium", slug: "possible-bipartition", note: "Dislikes are edges; the split is possible exactly when the graph is bipartite." },
    { id: 1559, title: "Detect Cycles in 2D Grid", difficulty: "Medium", slug: "detect-cycles-in-2d-grid", note: "A related cycle check on a grid, done with DFS plus a parent cell." },
  ],
};

export default meta;
