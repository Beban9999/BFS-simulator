## Explanation
Move every zero to the end while keeping the non-zeros in their original order, in place. The read/write pattern does it: `read` scans everything, `write` marks the end of the packed non-zero prefix.

When `read` finds a non-zero, **swap** it with `nums[write]` and advance `write`. Between `write` and `read` there are only zeros, so the swap moves a zero backwards and the non-zero forwards. Using swap instead of copy means no second "fill with zeros" pass is needed.

**Invariant:** `nums[0..write)` are the non-zeros seen so far in original order, and `nums[write..read)` are all zeros.

## Complexity
| | Time | Space |
|---|---|---|
| Swap compaction | O(n), ≤ n swaps | O(1) |
| Copy then zero-fill | O(n) | O(1) |

## When to use
- Stable partition by a predicate in place (non-zero / even / non-negative first).
- Whenever "relative order must be maintained" rules out the faster unstable two-ends partition.

## Pitfalls
- Swapping from both ends (like quicksort's partition) breaks the order of the non-zeros.
- When `write == read` the swap is a harmless self-swap; you can skip it as a micro-optimisation.
- Copy-based versions must remember to zero-fill the tail.

## Template
```python
w = 0
for r in range(len(a)):
    if a[r] != 0:
        a[w], a[r] = a[r], a[w]
        w += 1
```
