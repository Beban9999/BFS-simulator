## Explanation
Stability only matters when records carry more than their sort key: sorting plain integers gives the same output either
way. Stable sorts never move an element past an equal one — insertion sort shifts only past strictly larger keys, merge
sort takes from the left half on ties. Unstable sorts swap elements over long distances (selection, heap, quick sort),
which can carry a record past its equals.

**Invariant (stable sort):** if `a[i].key == a[j].key` and `i < j` in the input, then `a[i]` comes before `a[j]` in the output.

## Complexity
| Sort | Time | Extra space | Stable |
|---|---|---|---|
| Insertion | O(n²) | O(1) | yes |
| Merge | O(n log n) | O(n) | yes |
| Counting / radix | O(n + k) / O(d·(n + b)) | O(n + k) | yes |
| Selection | O(n²) | O(1) | no |
| Heap | O(n log n) | O(1) | no |
| Quick | O(n log n) avg | O(log n) | no |

Making any sort stable by tagging records with their index costs O(n) extra memory.

## When to use
- Sorting records (objects, tuples, rows) where ties must keep an existing order: logs, events by day, UI tables.
- Multi-pass sorting: secondary key first, then primary key (or radix sort digit by digit).
- When you can't rely on stability, sort by a composite key `(primary, secondary)` or `(key, index)`.

## Pitfalls
- Assuming a library sort is stable: check the docs (see the built-in sorts page) — e.g. C++ `std::sort` is not, `std::stable_sort` is.
- Doing the two passes in the wrong order: the **last** pass is the primary key.
- A comparator that returns "less" for equal elements (`<=` in a less-than function) breaks stability and can break the sort itself.
