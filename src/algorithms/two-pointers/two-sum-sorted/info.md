## Explanation
When the array is **sorted**, a pair sum can be steered. Put `left` on the smallest value and `right` on the largest. If their sum is too small, the only way to grow it is to move `left` rightwards; if it is too big, move `right` leftwards. Each step discards one element for good, so the scan is O(n) with O(1) memory.

Why is discarding safe? If `numbers[left] + numbers[right] < target`, then `numbers[left]` paired with *anything* at or left of `right` is also too small — `left` can never be part of the answer, so drop it. The mirrored argument drops `right` when the sum is too big.

**Invariant:** if an answer pair exists, both of its indexes lie in `[left, right]`.

## Complexity
| | Time | Space |
|---|---|---|
| Two pointers (sorted input) | O(n) | O(1) |
| Hash map (unsorted input) | O(n) | O(n) |
| Binary search per element | O(n log n) | O(1) |

## When to use
- Sorted array (or sortable without losing what you need) + "pair / triplet with a target sum, difference or product".
- Palindrome checks, reversing in place, merging from the ends.
- Problems where moving one end can only make the objective worse in one direction (container with most water).

## Pitfalls
- Using `left <= right` lets an element pair with itself.
- Sorting first destroys original indexes — store `(value, index)` pairs if the indexes matter.
- LeetCode 167 wants **1-based** indexes; this page returns 0-based.

## Template
```python
l, r = 0, len(a) - 1
while l < r:
    s = a[l] + a[r]
    if s == target: return l, r
    if s < target: l += 1
    else: r -= 1
```
