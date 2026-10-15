## Explanation
You can't rob two neighbouring houses. Define `dp[i]` = the most money you can take from houses `0..i`. For house `i` there are exactly two options:

- **skip** it: the best stays `dp[i − 1]`;
- **rob** it: you must have skipped house `i − 1`, so you get `dp[i − 2] + nums[i]`.

`dp[i] = max(dp[i − 1], dp[i − 2] + nums[i])`, with `dp[0] = nums[0]` and `dp[1] = max(nums[0], nums[1])`. The arrows show the two cells each entry reads; the winning option is highlighted.

To learn **which** houses were robbed, walk back from the end. If `dp[i] == dp[i − 1]`, house `i` was skipped; otherwise it was robbed and the walk jumps to `i − 2`. That path reconstruction works for any DP: re-ask which option produced each value.

**Invariant:** after step `i`, `dp[0..i]` are the optimal answers for every prefix of the street.

## Complexity
| | Time | Space |
|---|---|---|
| Table (this page) | O(n) | O(n) |
| Two variables (`prev2`, `prev1`) | O(n) | O(1) — but then you can't reconstruct the houses |

## When to use
- "Pick a subset of items in a line, no two adjacent, maximise the total".
- Any 1D DP whose state only looks a fixed distance back (Fibonacci, stairs, decode ways).
- Variants: circle (run twice), values instead of positions (Delete and Earn), trees (House Robber III).

## Pitfalls
- Greedy (take every other house, or always the biggest) fails: `[2, 7, 9, 3, 1]` needs houses 0, 2, 4 = 12.
- Handle `n = 0` and `n = 1` before reading `nums[1]`.
- With O(1) space you lose the reconstruction; keep the table if you need the chosen houses.

## Template
```python
def rob(nums):
    prev2 = prev1 = 0
    for x in nums:
        prev2, prev1 = prev1, max(prev1, prev2 + x)
    return prev1
```
