import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "topo-sort-dfs",
  title: "Topological Sort (DFS finish order)",
  category: "graphs",
  subcategory: "Cycles & ordering",
  difficulty: "intermediate",
  order: 3,
  summary: "A node finishes only after everything it points to has finished, so reversing the finish order puts every edge forward.",
  keywords: ["topological sort", "dfs", "postorder", "finish time", "reverse postorder", "dag", "three colour"],
  problems: [
    { id: 210, title: "Course Schedule II", difficulty: "Medium", slug: "course-schedule-ii", note: "Reverse postorder of a three-colour DFS; an edge into a GRAY node means no answer." },
    { id: 329, title: "Longest Increasing Path in a Matrix", difficulty: "Hard", slug: "longest-increasing-path-in-a-matrix", note: "The cells form a DAG; DFS with memo processes them in finish order." },
    { id: 1203, title: "Sort Items by Groups Respecting Dependencies", difficulty: "Hard", slug: "sort-items-by-groups-respecting-dependencies", note: "Two levels of topological sort: groups first, then items inside each group." },
  ],
};

export default meta;
