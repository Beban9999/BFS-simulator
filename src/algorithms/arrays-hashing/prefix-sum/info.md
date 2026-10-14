## Explanation
A prefix-sum array stores, at position `k`, the sum of the first `k` elements: `P[0] = 0` and `P[k+1] = P[k] + nums[k]`. Building it takes one pass.

After that, the sum of any range `nums[l..r]` is the total up to `r` minus the total before `l`: **`P[r+1] − P[l]`**. Each query becomes O(1) instead of O(n).

The extra leading `0` (size `n + 1`) is the trick that removes every special case for ranges starting at index 0.

**Invariant:** `P[k]` equals `nums[0] + … + nums[k-1]` (the sum of the first `k` items).

## Complexity
| | Time | Space |
|---|---|---|
| Build | O(n) | O(n) |
| Each query | O(1) | — |
| Without prefix sums | O(n) per query | O(1) |

## When to use
- Many range-sum queries on an array that **does not change** (if it changes, use a Fenwick or segment tree).
- "Sum / count of a subarray" questions: combine prefix sums with a hash map (Subarray Sum Equals K, Contiguous Array).
- Left/right totals around an index (pivot index, product except self uses the same idea with multiplication).
- 2D grids: see 2D prefix sums.

## Pitfalls
- Off-by-one: with the `n + 1` layout the range `[l, r]` is `P[r+1] − P[l]`, not `P[r] − P[l]`.
- Overflow in fixed-width languages when sums get large — use 64-bit integers.
- Prefix sums don't help with range **min/max** (no subtraction); use a sparse table or segment tree.

## Template
```python
prefix = [0]
for x in nums:
    prefix.append(prefix[-1] + x)
range_sum = lambda l, r: prefix[r + 1] - prefix[l]
```
