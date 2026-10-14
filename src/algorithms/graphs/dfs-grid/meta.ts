import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "dfs-grid",
  title: "Depth-First Search (grid)",
  category: "graphs",
  subcategory: "Traversal",
  difficulty: "core",
  order: 2,
  summary: "Follows one direction as far as it can before backtracking. It finds a path, but rarely the shortest.",
  keywords: ["dfs", "depth first", "stack", "backtrack", "maze", "grid", "reachability"],
  problems: [
    { id: 200, title: "Number of Islands", difficulty: "Medium", slug: "number-of-islands", note: "Run DFS from every unvisited land cell and count how many times you start." },
    { id: 733, title: "Flood Fill", difficulty: "Easy", slug: "flood-fill", note: "DFS from the clicked pixel recolouring every same-coloured neighbour." },
    { id: 695, title: "Max Area of Island", difficulty: "Medium", slug: "max-area-of-island", note: "DFS that returns the size of the component it explored." },
    { id: 1971, title: "Find if Path Exists in Graph", difficulty: "Easy", slug: "find-if-path-exists-in-graph", note: "Plain reachability: DFS (or BFS) from the source." },
    { id: 130, title: "Surrounded Regions", difficulty: "Medium", slug: "surrounded-regions", note: "DFS from border 'O's marks the regions that must survive." },
  ],
};

export default meta;
