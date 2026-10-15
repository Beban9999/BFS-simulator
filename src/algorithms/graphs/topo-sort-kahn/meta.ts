import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "topo-sort-kahn",
  title: "Topological Sort (Kahn's BFS)",
  category: "graphs",
  subcategory: "Cycles & ordering",
  difficulty: "core",
  order: 2,
  summary: "Repeatedly output a node with no remaining prerequisites (in-degree 0) and remove its outgoing edges; leftovers mean a cycle.",
  keywords: ["topological sort", "kahn", "in-degree", "indegree", "dag", "course schedule", "dependency order", "build order"],
  problems: [
    { id: 210, title: "Course Schedule II", difficulty: "Medium", slug: "course-schedule-ii", note: "This page: return Kahn's order, or an empty list when a cycle leaves courses behind." },
    { id: 207, title: "Course Schedule", difficulty: "Medium", slug: "course-schedule", note: "Only the yes/no part: did the order include every course?" },
    { id: 1136, title: "Parallel Courses", difficulty: "Medium", slug: "parallel-courses", note: "Process Kahn's queue level by level; the number of levels is the number of semesters." },
    { id: 2115, title: "Find All Possible Recipes from Given Supplies", difficulty: "Medium", slug: "find-all-possible-recipes-from-given-supplies", note: "Ingredients → recipes edges; a recipe is makeable once its in-degree drops to 0." },
    { id: 269, title: "Alien Dictionary", difficulty: "Hard", slug: "alien-dictionary", note: "Derive letter-order edges from adjacent words, then topologically sort the letters." },
  ],
};

export default meta;
