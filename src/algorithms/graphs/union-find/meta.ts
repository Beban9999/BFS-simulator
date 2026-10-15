import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "union-find",
  title: "Union-Find (Disjoint Set Union)",
  category: "graphs",
  subcategory: "Union-Find",
  difficulty: "core",
  order: 1,
  summary: "Each set is a tree named by its root; find walks up (and flattens the path), union hangs the shorter tree under the taller one.",
  keywords: ["union find", "disjoint set", "dsu", "path compression", "union by rank", "connected components", "redundant connection"],
  problems: [
    { id: 323, title: "Number of Connected Components in an Undirected Graph", difficulty: "Medium", slug: "number-of-connected-components-in-an-undirected-graph", note: "This page: start with n components and subtract one per successful union." },
    { id: 684, title: "Redundant Connection", difficulty: "Medium", slug: "redundant-connection", note: "The edge whose union fails (both ends already share a root) is the extra one." },
    { id: 721, title: "Accounts Merge", difficulty: "Medium", slug: "accounts-merge", note: "Union every email of an account with its first email, then group emails by root." },
    { id: 1584, title: "Min Cost to Connect All Points", difficulty: "Medium", slug: "min-cost-to-connect-all-points", note: "Kruskal: sort candidate edges and keep those that union two different sets." },
    { id: 990, title: "Satisfiability of Equality Equations", difficulty: "Medium", slug: "satisfiability-of-equality-equations", note: "Union all a==b first, then any a!=b inside one set is a contradiction." },
  ],
};

export default meta;
