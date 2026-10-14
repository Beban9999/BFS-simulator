## Explanation
Sometimes you don't binary search an array — you binary search **the answer**. Koko eats at speed `k` bananas per hour (one pile per hour at most), and must finish within `h` hours. Ask "is speed `k` fast enough?". If `k` works, every faster speed works too; if it fails, every slower speed fails. Over `k = 1, 2, 3, …` the answers look like `✗✗✗✓✓✓`, and we want the first ✓.

So: pick a range that surely contains the answer (`1` to `max(piles)` — at the max pile size every pile takes one hour), then run a lower-bound binary search using the feasibility check `hours(k) <= h`. Each check costs O(n), and there are O(log max) checks.

**Invariant:** every speed `< lo` is too slow, and `hi` is always fast enough.

## Complexity
| | Time | Space |
|---|---|---|
| Binary search on the answer | O(n · log M), M = max pile | O(1) |
| Try every speed | O(n · M) | O(1) |

## When to use
- "Minimum speed / capacity / time / largest value such that a condition holds", "minimise the maximum", "maximise the minimum".
- You can write a fast `feasible(x)` check (often greedy) and it is **monotonic** in `x`.
- The answer range is numeric and bounded even if huge (search up to 10⁹ is only ~30 steps).

## Pitfalls
- A wrong search range (e.g. `lo = 0` → division by zero, or `hi` too small to be feasible).
- Integer ceiling: `(p + k − 1) // k`, not `p // k + 1`.
- Getting the direction backwards: feasible → `hi = mid` (look for something smaller), infeasible → `lo = mid + 1`.

## Template
```python
lo, hi = smallest_possible, largest_possible   # hi must be feasible
while lo < hi:
    mid = (lo + hi) // 2
    if feasible(mid): hi = mid
    else: lo = mid + 1
return lo
```
