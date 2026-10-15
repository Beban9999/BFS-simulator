## Explanation
The k-th largest element is the one that would sit at index `n − k` if the array were sorted ascending. Quickselect finds it **without sorting everything**.

It uses quick sort's partition: after partitioning `nums[lo..hi]`, the pivot lands at its final sorted index `i`. If `i` is the target, done. Otherwise the target is entirely on one side, so **only that side** is searched next — the other side is thrown away. Quick sort recurses into both halves; quickselect into one, which turns O(n log n) into O(n) on average (n + n/2 + n/4 + … ≈ 2n).

The pivot choice matters just as for quick sort: with "last element" on sorted input every partition removes only the pivot, giving O(n²) (see the worst-case preset). A random pivot makes that vanishingly unlikely; median-of-medians guarantees O(n) but is rarely used in practice.

**Invariant:** the target index always lies in `[lo, hi]`; everything left of `lo` is ≤ the answer and everything right of `hi` is ≥ it.

## Complexity
| Case | Time | Space |
|---|---|---|
| Average (random-ish pivots) | O(n) | O(1) iterative |
| Worst (bad pivots, e.g. sorted input + last pivot) | O(n²) | O(1) |

It reorders the input array. A size-k min-heap is the alternative: O(n log k) time, O(k) space, works on streams and doesn't modify the input.

## When to use
- k-th smallest / largest, median, "top k" (when the k items can come back in any order).
- Partition-around-a-rank problems: k closest points, wiggle sort via the median.
- Prefer a heap when data arrives as a stream or must not be modified.

## Pitfalls
- Off-by-one between "k-th largest" (index `n − k`) and "k-th smallest" (index `k − 1`).
- A fixed pivot on sorted input is O(n²) — LeetCode's tests include such cases; shuffle first or pick a random pivot.
- With many duplicates Lomuto still degrades; a three-way partition handles them.

## Template
```python
import random
def quickselect(a, target):           # target = index in sorted order
    lo, hi = 0, len(a) - 1
    while True:
        r = random.randint(lo, hi); a[r], a[hi] = a[hi], a[r]
        pivot, i = a[hi], lo
        for j in range(lo, hi):
            if a[j] < pivot: a[i], a[j] = a[j], a[i]; i += 1
        a[i], a[hi] = a[hi], a[i]
        if i == target: return a[i]
        lo, hi = (i + 1, hi) if i < target else (lo, i - 1)
```
