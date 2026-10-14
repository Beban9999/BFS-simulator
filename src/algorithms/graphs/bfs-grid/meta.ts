import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "bfs-grid",
  title: "Breadth-First Search (grid)",
  category: "graphs",
  subcategory: "Traversal",
  difficulty: "core",
  order: 1,
  summary: "Explores outward one ring at a time, so the first path it finds to the target is the shortest.",
  keywords: ["bfs", "breadth first", "shortest path", "queue", "maze", "grid"],
  problems: [
    { id: 1091, title: "Shortest Path in Binary Matrix", difficulty: "Medium", slug: "shortest-path-in-binary-matrix", note: "BFS from the top-left over 8 directions; the layer count is the answer." },
    { id: 1926, title: "Nearest Exit from Entrance in Maze", difficulty: "Medium", slug: "nearest-exit-from-entrance-in-maze", note: "Plain grid BFS that stops at the first border cell." },
    { id: 994, title: "Rotting Oranges", difficulty: "Medium", slug: "rotting-oranges", note: "Multi-source BFS: start with every rotten orange in the queue." },
    { id: 542, title: "01 Matrix", difficulty: "Medium", slug: "01-matrix", note: "Multi-source BFS from all zeros gives each cell its distance." },
    { id: 286, title: "Walls and Gates", difficulty: "Medium", slug: "walls-and-gates", note: "Multi-source BFS from every gate fills the distances." },
  ],
};

export default meta;
