## Explanation
In a sorted array, one comparison with the middle element tells you which half the target must be in. Binary search keeps a range `[lo, hi]` that still might contain the target and throws away half of it every step, so it needs only ⌈log₂ n⌉ + 1 comparisons.

This version uses a **closed** interval: both `lo` and `hi` are candidates. The loop runs while the range is non-empty (`lo <= hi`), and each branch moves past `mid` (`mid + 1` or `mid − 1`) because `mid` itself has just been ruled out.

**Invariant:** if the target is in the array, its index lies in `[lo, hi]`.

## Complexity
| Case | Time | Space |
|---|---|---|
| Best (middle hit) | O(1) | O(1) |
| Average / worst | O(log n) | O(1) iterative, O(log n) recursive |

## When to use
- Sorted arrays, or anything with a **monotonic** yes/no property (first bad version, smallest feasible answer).
- "Find in O(log n)", "sorted", "rotated", "minimise the maximum" are strong signals.
- Variants: lower/upper bound for first/last occurrence, rotated arrays, binary search on the answer.

## Pitfalls
- **Interval style must be consistent.** Closed `[lo, hi]` → `while lo <= hi`, `hi = mid − 1`. Half-open `[lo, hi)` → `while lo < hi`, `hi = mid`. Mixing them causes infinite loops or skipped elements.
- `(lo + hi) / 2` can overflow 32-bit ints in Java/C++; use `lo + (hi − lo) / 2`.
- Duplicates: classic search returns *some* matching index, not necessarily the first.

## Template
```python
lo, hi = 0, len(a) - 1
while lo <= hi:
    mid = (lo + hi) // 2
    if a[mid] == t: return mid
    if a[mid] < t: lo = mid + 1
    else: hi = mid - 1
return -1
```
