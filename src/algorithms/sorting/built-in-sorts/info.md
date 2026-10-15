## Explanation
No standard library ships a textbook sort. They combine pieces you can watch on the other pages: insertion sort for
tiny ranges, quicksort for speed, heapsort as a worst-case safety net, merge sort for stability and natural runs.
Languages that sort objects by default (Python, Java objects, JavaScript) chose stable merge-based hybrids; languages
that mostly sort plain values in place chose quicksort-based ones and offer a separate stable sort.

## Complexity
| Hybrid | Best | Worst | Extra space | Stable |
|---|---|---|---|---|
| Timsort / powersort | O(n) on sorted input | O(n log n) | O(n) | yes |
| Introsort | O(n log n) | O(n log n) | O(log n) | no |
| pdqsort / ipnsort | O(n) on sorted or reversed input | O(n log n) | O(log n) | no |
| Dual-pivot quicksort (Java primitives) | O(n log n) | O(n log n) per the docs | O(log n) | no |

## When to use
- Almost always: the built-in sort beats a hand-written one. Write your own only when asked, or for counting / radix sort on small integer keys.
- Need ties kept in order? Use the stable variant (`stable_sort`, `SortStableFunc`, `OrderBy`, Rust `sort`).
- Only need the k-th element or the top k? `nth_element` / `select_nth_unstable` / a heap is O(n) or O(n log k).

## Pitfalls
- JavaScript's default sort compares strings: always pass `(a, b) => a - b` for numbers.
- Comparators must be consistent (strict weak ordering); `a - b` on large ints overflows in Java / C#.
- Python's `list.sort()` returns `None`; JavaScript's `sort()` mutates the array you passed in.

## Sources
Checked on 2026-10-15: Python docs (`list.sort`, `Objects/listsort.txt` — powersort merge policy since 3.11), Java SE 21
`Arrays` API notes, V8 blog “Getting things sorted in V8” and MDN `Array.prototype.sort` (stable since ES2019),
cppreference `std::sort` (LWG 713, LLVM 14 note), Microsoft Learn `Array.Sort` remarks, Go 1.19 release notes and
`sort` package docs, Rust `slice::sort` / `sort_unstable` docs and the Rust 1.81 release post.
