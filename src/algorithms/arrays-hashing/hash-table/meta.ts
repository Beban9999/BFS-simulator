import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "hash-table",
  title: "Hash Table Internals",
  category: "arrays-hashing",
  subcategory: "Hashing",
  difficulty: "core",
  order: 1,
  summary: "Hash a key to a bucket index; resolve collisions by chaining or linear probing; double and rehash when the load factor gets high.",
  keywords: ["hash map", "hash function", "bucket", "collision", "chaining", "open addressing", "linear probing", "load factor", "rehash", "design hashmap"],
  problems: [
    { id: 706, title: "Design HashMap", difficulty: "Easy", slug: "design-hashmap", note: "Implement exactly this: buckets of (key, value) chains." },
    { id: 705, title: "Design HashSet", difficulty: "Easy", slug: "design-hashset", note: "Same structure without values." },
    { id: 1, title: "Two Sum", difficulty: "Easy", slug: "two-sum", note: "The classic consumer of O(1) average lookups." },
    { id: 380, title: "Insert Delete GetRandom O(1)", difficulty: "Medium", slug: "insert-delete-getrandom-o1", note: "Hash map from value to index into an array; swap-with-last on delete." },
  ],
};

export default meta;
