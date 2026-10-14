## Explanation
Kadane's algorithm finds the contiguous subarray with the largest sum in a single left-to-right pass.

At every index it asks one question: *is the best subarray ending here an extension of the previous one, or does it start fresh here?* If the running sum `cur` is already negative, carrying it forward can only hurt, so it restarts at `nums[i]`. Otherwise it extends. The best `cur` ever seen is the answer.

It is the simplest example of dynamic programming: `cur[i] = max(nums[i], cur[i-1] + nums[i])`, kept in one variable instead of a table.

**Invariant:** after processing index `i`, `cur` is the largest sum of a subarray that *ends exactly at* `i`, and `best` is the largest sum of any subarray inside `nums[0..i]`.

## Complexity
| | Time | Space |
|---|---|---|
| All cases | O(n) | O(1) |

## When to use
- "Maximum / minimum sum of a **contiguous** subarray".
- Problems that reduce to it: max profit from price differences, circular max subarray (total − min subarray), max absolute sum.
- Product version: track both max and min ending here, because a negative number swaps them.

## Pitfalls
- Initialising `best = 0` breaks all-negative arrays: the answer for `[-3, -1, -2]` is `-1`, not `0`. Start from `nums[0]`.
- "Subarray" means contiguous; "subsequence" is a different (easier) problem — just add the positives.
- For the circular variant, if every number is negative return the plain Kadane answer (total − min would be 0, an empty subarray).

## Template
```python
def kadane(nums):
    best = cur = nums[0]
    for x in nums[1:]:
        cur = max(x, cur + x)   # extend or restart
        best = max(best, cur)
    return best
```
