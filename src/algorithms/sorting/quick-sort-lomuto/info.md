## Explanation
Quick sort picks a **pivot** value and **partitions** the range around it: everything smaller goes to the left, everything else to the right, and the pivot drops into the slot between them — which is its final sorted position. Then each side is sorted recursively. Unlike merge sort, all the work happens *before* the recursive calls and no merge is needed.

The **Lomuto** partition parks the pivot at the end and sweeps `j` from left to right with a boundary `i`: whenever `nums[j] < pivot`, it is swapped to position `i` and the boundary grows. At the end the pivot is swapped into position `i`.

**Pivot choice decides the speed.** If the pivot splits the range roughly in half every time, the recursion is O(log n) deep and the total work is O(n log n). If it is always the smallest or largest value — e.g. "last element" on already-sorted input — one side is empty every time and the work becomes O(n²). Try the two "sorted input" presets to compare. Median-of-three (the median of first, middle and last) or a random pivot avoids that easy trap.

**Invariant (during a partition):** `nums[lo..i−1] < pivot`, `nums[i..j−1] ≥ pivot`, and `nums[j..hi−1]` is not yet examined.

## Complexity
| Case | Time | Extra space |
|---|---|---|
| Best / average | O(n log n) | O(log n) recursion |
| Worst (bad pivots, e.g. sorted input + last pivot) | O(n²) | O(n) recursion |

Stable: **no**. In practice it is usually faster than merge and heap sort thanks to in-place, cache-friendly scans; library "introsort" variants fall back to heap sort if recursion gets too deep.

## When to use
- General-purpose in-memory sorting when stability is not required.
- The **partition** step on its own solves many problems: quickselect (k-th element), moving evens before odds, splitting around a threshold.
- If there are many equal keys, use a three-way (Dutch national flag) partition.

## Pitfalls
- A fixed first/last pivot on sorted or reversed data → O(n²) and possibly a stack overflow.
- Lomuto does many swaps when many values equal the pivot; Hoare's partition or a three-way partition handles duplicates better.
- Recurse on `(lo, p − 1)` and `(p + 1, hi)` — the pivot is already final, so excluding it guarantees progress.
- To bound the stack at O(log n), recurse into the smaller side first and loop on the larger one.

## Template
```python
def partition(a, lo, hi):          # pivot = a[hi]
    pivot, i = a[hi], lo
    for j in range(lo, hi):
        if a[j] < pivot:
            a[i], a[j] = a[j], a[i]; i += 1
    a[i], a[hi] = a[hi], a[i]
    return i
```
