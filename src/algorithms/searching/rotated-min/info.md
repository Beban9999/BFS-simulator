## Explanation
The minimum of a rotated sorted array sits right after the single "drop" where values fall (`7 → 0` in `[4,5,6,7,0,1,2]`). Compare `nums[mid]` with the right end `nums[hi]`:

- `nums[mid] > nums[hi]`: values fall somewhere between `mid` and `hi`, so the drop — and the minimum — is strictly right of `mid`: `lo = mid + 1`.
- Otherwise `[mid..hi]` is increasing, so the minimum is `mid` or something left of it: `hi = mid` (keep `mid`).

It's the lower-bound pattern in disguise: the predicate "`nums[i] <= nums[last]`" is ✗ for the left run and ✓ for the right run, and the minimum is the first ✓.

**Invariant:** the minimum's index is always in `[lo, hi]`.

## Complexity
| | Time | Space |
|---|---|---|
| Distinct values | O(log n) | O(1) |
| With duplicates (LC 154) | O(n) worst case | O(1) |

## When to use
- Finding the rotation point / number of rotations of a sorted array.
- As a first step for searching a rotated array with two plain binary searches.

## Pitfalls
- Comparing with `nums[lo]` instead of `nums[hi]` fails on arrays that aren't rotated at all.
- Using `hi = mid − 1` skips the minimum when it is exactly at `mid`.
- `while lo <= hi` with `hi = mid` loops forever.

## Template
```python
lo, hi = 0, len(a) - 1
while lo < hi:
    mid = (lo + hi) // 2
    if a[mid] > a[hi]: lo = mid + 1
    else: hi = mid
return a[lo]
```
