## Explanation
A difference array is the inverse of a prefix sum. Instead of storing values, store how much each value **differs from the previous one**. Adding `v` to every element of `[l, r]` then only changes two differences: `+v` at `l` (the jump up) and `−v` at `r + 1` (the jump back down).

After all updates, one prefix-sum sweep turns the differences back into values. `k` range updates on an array of size `n` cost O(k + n) instead of O(k·n).

**Invariant:** at any time, `prefix_sum(diff)[i]` equals the value position `i` would have if every update so far had been applied directly.

## Complexity
| | Time | Space |
|---|---|---|
| k updates + final sweep | O(k + n) | O(n) |
| Applying each update directly | O(k · n) | O(1) extra |

## When to use
- Many "add v to a range" operations, with the final array (or the max over it) needed once at the end.
- Interval overlaps and loads: car pooling, flight bookings, "how many meetings at time t".
- If you need to **read** values between updates, use a Fenwick tree with range updates instead.

## Pitfalls
- Allocate `n + 1` slots so `diff[r + 1]` never goes out of bounds when `r = n − 1`.
- The sweep is a running sum of `diff`, not a sum of `diff` and the original values — add the original array afterwards if it wasn't all zeros.
- For 2D, mark four corners: `+v` at `(r1,c1)`, `−v` at `(r1,c2+1)` and `(r2+1,c1)`, `+v` at `(r2+1,c2+1)`.

## Template
```python
diff = [0] * (n + 1)
for l, r, v in updates:
    diff[l] += v
    diff[r + 1] -= v
values = list(itertools.accumulate(diff[:n]))
```
