## Explanation
Insertion sort is slow on random data because an element can only move one slot per comparison. Shell sort fixes that by first running insertion sort on elements that are **gap** positions apart. Each such pass sorts several interleaved sub-sequences at once (indexes 0, gap, 2·gap, … then 1, 1+gap, …), letting small values jump far to the left in a few hops.

The gap then shrinks, and the final pass with gap 1 is a plain insertion sort — but on an array that is already nearly sorted, which is exactly where insertion sort is fast.

**Invariant:** after the pass with gap `h`, the array is *h-sorted*: `nums[k] ≤ nums[k + h]` for every `k`. A later, smaller-gap pass never destroys the h-sortedness that earlier passes built.

## Complexity
| Gap sequence | Worst-case time |
|---|---|
| Shell's original n/2, n/4, … 1 (shown here) | Θ(n²) |
| Hibbard 1, 3, 7, 15, … (2ᵏ − 1) | O(n^1.5) |
| Pratt 2ᵖ3ᑫ (1, 2, 3, 4, 6, 8, 9, …) | O(n log² n) |

Space: O(1). Stable: **no** — long gap moves can reorder equal values. The best known sequences are found empirically (e.g. Ciura's 1, 4, 10, 23, 57, 132, …).

## When to use
- Embedded or memory-constrained code that needs a reasonably fast in-place sort with tiny code size.
- Medium-sized arrays where O(n log n) library sorts are unavailable.
- In interviews it mostly appears as a question about gap sequences and why it beats insertion sort.

## Pitfalls
- The last gap must be 1, otherwise the array is only h-sorted, not sorted.
- Gaps that share factors (powers of two) leave some elements unmixed until the end — that is why Shell's original sequence has a Θ(n²) worst case.
- It is not stable.

## Template
```python
gap = len(a) // 2
while gap:
    for i in range(gap, len(a)):
        key, j = a[i], i
        while j >= gap and a[j - gap] > key:
            a[j] = a[j - gap]; j -= gap
        a[j] = key
    gap //= 2
```
