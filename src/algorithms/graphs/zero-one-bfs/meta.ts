import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "zero-one-bfs",
  title: "0-1 BFS (deque)",
  category: "graphs",
  subcategory: "Shortest paths",
  difficulty: "intermediate",
  order: 3,
  summary: "When every edge costs 0 or 1, a deque replaces Dijkstra's heap: free edges go to the front, paid edges to the back.",
  keywords: ["0-1 bfs", "zero one bfs", "deque", "binary weights", "obstacle removal", "shortest path"],
  problems: [
    { id: 2290, title: "Minimum Obstacle Removal to Reach Corner", difficulty: "Hard", slug: "minimum-obstacle-removal-to-reach-corner", note: "Stepping onto an obstacle costs 1, an empty cell 0: textbook 0-1 BFS on a grid." },
    { id: 1368, title: "Minimum Cost to Make at Least One Valid Path in a Grid", difficulty: "Hard", slug: "minimum-cost-to-make-at-least-one-valid-path-in-a-grid", note: "Following a cell's arrow is free, any other direction costs 1." },
    { id: 1824, title: "Minimum Sideway Jumps", difficulty: "Medium", slug: "minimum-sideway-jumps", note: "Moving forward in a lane is free, switching lanes costs 1 (DP works too)." },
  ],
};

export default meta;
