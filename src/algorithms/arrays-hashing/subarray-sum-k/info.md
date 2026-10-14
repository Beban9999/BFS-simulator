## Explanation
A subarray `nums[j..i]` sums to `k` exactly when `P[i+1] − P[j] = k`, i.e. when an **earlier prefix total equals `total − k`**. So scan once, keep the running `total`, and keep a hash map counting how many times each prefix total has appeared. At every index, add `count[total − k]` to the answer — each of those earlier prefixes marks the start of one valid subarray ending here.

The map starts as `{0: 1}`: the empty prefix, which lets subarrays that start at index 0 be counted.

This works with **negative numbers**, which is exactly where the sliding-window approach breaks (a window's sum is no longer monotonic when you grow or shrink it).

**Invariant:** before processing index `i`, `count[v]` is the number of prefixes `P[0..i]` whose total is `v`.

## Complexity
| | Time | Space |
|---|---|---|
| Prefix + hash map | O(n) | O(n) |
| Try every subarray | O(n²) | O(1) |

## When to use
- "Count / find subarrays whose sum (or xor, or mod) equals a target", especially with negatives.
- "Longest subarray with sum k / equal 0s and 1s": store the **first index** of each prefix instead of a count.
- Variants keyed by `total % k` for divisibility.

## Pitfalls
- Forgetting `count[0] = 1` misses subarrays that start at index 0.
- Updating the map **before** the lookup can count an empty subarray when `k = 0`.
- Sliding window only works when all numbers are non-negative; don't reach for it here.

## Template
```python
from collections import defaultdict

def count_subarrays(nums, k):
    seen = defaultdict(int); seen[0] = 1
    total = ans = 0
    for x in nums:
        total += x
        ans += seen[total - k]
        seen[total] += 1
    return ans
```
