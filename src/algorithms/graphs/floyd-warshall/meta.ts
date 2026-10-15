import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "floyd-warshall",
  title: "Floyd-Warshall (all pairs)",
  category: "graphs",
  subcategory: "Shortest paths",
  difficulty: "intermediate",
  order: 5,
  summary: "A V×V distance table improved V times: in round k, every pair may route through node k.",
  keywords: ["floyd warshall", "all pairs shortest path", "apsp", "distance matrix", "dynamic programming", "transitive closure"],
  problems: [
    { id: 1334, title: "Find the City With the Smallest Number of Neighbors at a Threshold Distance", difficulty: "Medium", slug: "find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance", note: "Floyd-Warshall, then count for each city how many others are within the threshold." },
    { id: 1462, title: "Course Schedule IV", difficulty: "Medium", slug: "course-schedule-iv", note: "Transitive closure: reach[i][j] |= reach[i][k] and reach[k][j]." },
    { id: 2976, title: "Minimum Cost to Convert String I", difficulty: "Medium", slug: "minimum-cost-to-convert-string-i", note: "26 letters as nodes; all-pairs cheapest conversions, then sum per position." },
  ],
};

export default meta;
