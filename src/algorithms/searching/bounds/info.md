## Explanation
Most binary-search problems are really "find the **boundary**" problems. Write a yes/no predicate that is false for a prefix of the array and true for the rest — `✗✗✗✓✓✓` — and binary search for the first ✓.

- **Lower bound**: predicate `nums[i] >= target` → the first index whose value is at least the target (Python `bisect_left`, C++ `lower_bound`). It is also the insertion point that keeps the array sorted.
- **Upper bound**: predicate `nums[i] > target` → the first index past every copy of the target (`bisect_right`, `upper_bound`).

So the target occupies `[lower, upper − 1]`, and `upper − lower` is how many times it occurs.

This template uses a **half-open** range `[lo, hi)` with `hi = len(nums)` (the answer can be "past the end"). When `mid` satisfies the predicate it might be the answer, so `hi = mid` keeps it; otherwise `lo = mid + 1`. The loop ends when `lo == hi`, the boundary.

**Invariant:** every index `< lo` is ✗, every index `≥ hi` is ✓.

## Complexity
| | Time | Space |
|---|---|---|
| Each bound | O(log n) | O(1) |
| First & last position | O(log n) (two searches) | O(1) |

## When to use
- First / last occurrence, count of a value in a sorted array, insertion position.
- Any monotonic predicate over indexes or values: first bad version, smallest x with f(x) true — see "binary search on the answer".

## Pitfalls
- `lo < hi` vs `lo <= hi`: with `hi = mid` (half-open) you **must** use `lo < hi`, or the loop never ends.
- Initialising `hi = len(nums) − 1` makes "past the end" unreachable — the target larger than everything breaks.
- After lower bound, check `first < len(nums) and nums[first] == target` before claiming the target exists.
- Rounding `mid` up instead of down with `lo = mid` (not `mid + 1`) creates infinite loops on two-element ranges.

## Template
```python
def first_true(lo, hi, ok):     # ok is ✗✗✗✓✓✓ over [lo, hi)
    while lo < hi:
        mid = (lo + hi) // 2
        if ok(mid): hi = mid
        else: lo = mid + 1
    return lo                   # == hi if no index is ✓
```
