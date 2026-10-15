## Explanation
Merge sort is the textbook **divide and conquer** algorithm. To sort `nums[lo..hi]`: split it at the middle, recursively sort the left half and the right half, then **merge** the two sorted halves into one sorted run.

Merging is the real work. Two pointers start at the front of each half; repeatedly copy the smaller of the two front values into a buffer and advance that pointer. When one half runs out, the rest of the other half is already in order and is copied as-is. Finally the buffer is written back over `nums[lo..hi]`.

Because the halves always have equal size, the recursion is only ⌈log₂ n⌉ levels deep, and each level does O(n) merge work in total — so the running time is O(n log n) for **every** input.

**Invariant:** when `merge(lo, mid, hi)` starts, `nums[lo..mid]` and `nums[mid+1..hi]` are each sorted; the buffer always holds the smallest values of both halves, in sorted order.

## Complexity
| Case | Time | Space |
|---|---|---|
| Best / average / worst | O(n log n) | O(n) buffer + O(log n) recursion |

Stable: yes, as long as ties take from the **left** half (`<=`). On linked lists the merge needs no buffer, so merge sort uses O(1) extra space besides recursion.

## When to use
- You need a guaranteed O(n log n) or a **stable** sort (e.g. sorting records by several keys).
- Linked lists (no random access needed) and external sorting of data that doesn't fit in memory.
- "Count pairs i < j with some relation" problems: count during the merge (inversions, reverse pairs, smaller numbers after self).
- Merging k sorted lists / arrays generalises the merge step (use a heap).

## Pitfalls
- Using `<` instead of `<=` in the merge makes it unstable.
- `mid = (lo + hi) // 2` with `merge_sort(lo, mid)` and `merge_sort(mid + 1, hi)`; splitting as `(lo, mid - 1)` / `(mid, hi)` can recurse forever on two elements.
- Allocating a new buffer in every call is fine for clarity, but one shared buffer is faster.
- Don't forget to copy the leftovers of **both** halves.

## Template
```python
def merge_sort(a):
    if len(a) <= 1:
        return a
    mid = len(a) // 2
    left, right = merge_sort(a[:mid]), merge_sort(a[mid:])
    out, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]: out.append(left[i]); i += 1
        else:                   out.append(right[j]); j += 1
    return out + left[i:] + right[j:]
```
