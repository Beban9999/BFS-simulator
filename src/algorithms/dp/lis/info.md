## Explanation
A subsequence keeps some elements in their original order; it must be strictly increasing here.

**O(n²) table.** Let `dp[i]` be the length of the longest increasing subsequence that **ends at index `i`**. Any earlier `j` with `nums[j] < nums[i]` can be extended by `nums[i]`, so `dp[i] = 1 + max(dp[j])` over those `j` (or 1 if there is none). The arrows point from the valid `j`s; the best one is remembered in `prev[i]`. The answer is the largest `dp[i]`, and following `prev` from there rebuilds the subsequence.

**O(n log n) tails.** Keep `tails[k]`, the **smallest** value that can end an increasing subsequence of length `k + 1`. `tails` is always sorted. For each `x`, binary-search the first tail `≥ x`. If there is none, `x` extends the longest subsequence (append). Otherwise `x` replaces that tail: a subsequence of that length can now end lower, which leaves more room for future numbers. The length of `tails` is the LIS length. (`tails` itself is usually **not** a valid subsequence.)

**Invariant (tails):** `tails` is strictly increasing, and `tails[k]` is the minimum ending value over all increasing subsequences of length `k + 1` seen so far.

## Complexity
| Version | Time | Space |
|---|---|---|
| dp table | O(n²) | O(n) |
| tails + binary search | O(n log n) | O(n) |

## When to use
- Longest chain under a partial order: envelopes, boxes, word chains, scheduling.
- Non-decreasing variant: use `bisect_right` instead of `bisect_left`.
- Need the sequence itself in O(n log n)? Store the index in `tails` and a parent pointer per element.

## Pitfalls
- Subsequence ≠ subarray: elements need not be adjacent.
- Strictly increasing vs non-decreasing changes `<` to `<=` and `bisect_left` to `bisect_right`.
- Don't report `tails` as the subsequence.
- The answer is `max(dp)`, not `dp[n − 1]`.

## Template
```python
from bisect import bisect_left

def lis(nums):
    tails = []
    for x in nums:
        k = bisect_left(tails, x)
        tails[k:k + 1] = [x]        # replace or append
    return len(tails)
```
