## Explanation
Each item has a weight and a value; pick a subset with total weight ≤ `W` and maximum value. Every item is either **left** or **taken** once (hence "0/1").

`dp[i][w]` = the best value using only the first `i` items with capacity `w`. For item `i` (weight `wt`, value `val`):
- **leave it:** `dp[i − 1][w]` (straight above);
- **take it** (if `wt ≤ w`): `dp[i − 1][w − wt] + val` (up and `wt` columns to the left).

`dp[i][w]` is the larger of the two. Both arrows point into the **previous row**, which is what makes each item usable at most once. To see which items were packed, walk back from `dp[n][W]`: if the value differs from the cell above, item `i` was taken, so subtract its weight and move up.

**1D trick.** Row `i` only reads row `i − 1`, so one array suffices if each `w` is updated **from high to low**. Going downward, `dp[w − wt]` still holds the previous row's value when it is read. Going upward would read the current row and let an item be taken twice — that is the *unbounded* knapsack.

**Invariant:** after row `i`, `dp[i][w]` is optimal for items `0..i−1` and every capacity `w`.

## Complexity
| | Time | Space |
|---|---|---|
| n items, capacity W | O(n·W) | O(n·W) table, O(W) with the 1D trick (no item list then) |

This is *pseudo-polynomial*: it depends on the numeric value W, not just the input size.

## When to use
- Choose a subset under a budget/capacity: partition, subset sum, target sum, ones and zeroes.
- Counting variants: replace `max` with `+` (number of subsets reaching each sum).
- Unbounded variant (coin change): take reads the **same** row; in 1D, iterate `w` upward.

## Pitfalls
- Upward iteration in the 1D version silently turns 0/1 into unbounded.
- Greedy by value/weight ratio is only correct for the *fractional* knapsack.
- Huge W (10⁹) makes the table impossible; flip the DP to "min weight for each value" or use meet-in-the-middle.

## Template
```python
def knapsack(items, W):              # items: (weight, value)
    dp = [0] * (W + 1)
    for wt, val in items:
        for w in range(W, wt - 1, -1):
            dp[w] = max(dp[w], dp[w - wt] + val)
    return dp[W]
```
