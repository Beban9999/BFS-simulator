import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "red-black-insert",
  title: "Red-Black Tree Insert",
  category: "trees",
  subcategory: "Self-balancing",
  difficulty: "advanced",
  order: 2,
  summary: "Insert a red leaf, then repair \"red under red\": recolor when the uncle is red, otherwise rotate (triangle → line → rotate the grandparent).",
  keywords: ["red black tree", "red-black insert", "recolor", "rotation", "uncle", "self-balancing", "TreeMap"],
  problems: [
    { id: 729, title: "My Calendar I", difficulty: "Medium", slug: "my-calendar-i", note: "Floor/ceiling on an ordered map — Java's TreeMap is a red-black tree." },
    { id: 220, title: "Contains Duplicate III", difficulty: "Hard", slug: "contains-duplicate-iii", note: "Sliding window kept in an ordered set; ceiling queries in O(log k)." },
    { id: 352, title: "Data Stream as Disjoint Intervals", difficulty: "Hard", slug: "data-stream-as-disjoint-intervals", note: "An ordered map of interval starts with neighbour lookups." },
    { id: 1438, title: "Longest Continuous Subarray With Absolute Diff Less Than or Equal to Limit", difficulty: "Medium", slug: "longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit", note: "A sorted multiset (balanced BST) gives window min and max." },
  ],
};

export default meta;
