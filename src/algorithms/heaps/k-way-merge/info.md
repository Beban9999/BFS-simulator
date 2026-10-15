## Explanation
Merging two sorted arrays takes one comparison per output value. With k arrays, comparing all k fronts every time costs O(k) per value. A **min-heap of the fronts** finds the smallest in O(log k) instead.

Start with the first value of every non-empty array in the heap, tagged with which array it came from and its index there. Then repeat: pop the smallest entry, append its value to the output, and push the next value of the **same** array (if there is one). The heap always holds at most k entries — one per array that still has values.

Python compares tuples left to right, so `(value, array index, position)` breaks ties by array index and never needs to compare anything else.

**Invariant:** the heap holds exactly the current front of every array that is not yet exhausted, and `out` is the sorted merge of everything popped so far.

## Complexity
| Approach | Time | Space |
|---|---|---|
| Heap of fronts | O(N log k) | O(k) heap (+ O(N) output) |
| Concatenate and sort | O(N log N) | O(N) |
| Pairwise merging (tournament) | O(N log k) | O(N) |

N = total number of values, k = number of arrays.

## When to use
- Merging sorted runs: external sorting, log files, database merge joins, combining search results.
- "k-th smallest" over several sorted sources (rows of a sorted matrix, pair sums) — stop after k pops.
- Any time each source can tell you its *next* candidate, and you need the global next.

## Pitfalls
- Push the successor from the **same** array you just popped from — that's why the entry stores the array index.
- Skip empty arrays when seeding.
- Pushing all N values up front works but costs O(N log N) and O(N) memory.

## Template
```python
import heapq
def merge(arrays):
    return list(heapq.merge(*arrays))   # the standard library does exactly this
```
