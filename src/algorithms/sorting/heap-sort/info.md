## Explanation
A **binary max-heap** stored in an array is a complete binary tree where index `i` has children `2i + 1` and `2i + 2`, and every parent is ≥ its children — so the maximum is always at index 0. The "level" row under the bars shows each index's depth in that implicit tree.

Heap sort has two phases:
1. **Build the heap.** Sift down every non-leaf, from the last parent (`n // 2 − 1`) back to the root. Sifting down swaps a value with its larger child until it is ≥ both children. Doing this bottom-up costs only O(n) in total, because most nodes are near the bottom and sift only a little.
2. **Extract.** Swap the root (the maximum) with the last heap element; the max is now final at the end. Shrink the heap by one and sift the new root down to repair it. Repeat until the heap has one element.

It is in place and O(n log n) in every case, but it jumps around memory (parent ↔ child), which makes it slower in practice than a well-tuned quick sort.

**Invariant:** during phase 2, `nums[0..end−1]` is a valid max-heap and `nums[end..n−1]` holds the largest values in sorted order.

## Complexity
| Phase | Time |
|---|---|
| Build heap (bottom-up) | O(n) |
| n − 1 extractions | O(n log n) |
| **Total**, best / average / worst | **O(n log n)**, O(1) extra space |

Stable: **no** — the root swap moves values far across equal ones.

## When to use
- You need O(n log n) worst case **and** O(1) extra memory (this is why introsort falls back to it).
- The building blocks matter more than the sort itself: heapify, sift-up/sift-down, and priority queues power top-K, k-way merge, Dijkstra and schedulers.

## Pitfalls
- Children of `i` are `2i + 1` and `2i + 2` (0-based); parents are `(i − 1) // 2`.
- Sift down **within the current heap size** (`end`), not `n`, or the sorted tail gets pulled back in.
- Building the heap with n sift-ups (insert one by one) costs O(n log n); bottom-up sift-down is O(n).
- Python's `heapq` is a **min**-heap; negate values for a max-heap.

## Template
```python
def sift_down(a, i, size):
    while True:
        big, l, r = i, 2*i + 1, 2*i + 2
        if l < size and a[l] > a[big]: big = l
        if r < size and a[r] > a[big]: big = r
        if big == i: return
        a[i], a[big] = a[big], a[i]; i = big
```
