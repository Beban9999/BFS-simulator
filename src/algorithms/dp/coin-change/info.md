## Explanation
`dp[a]` is the fewest coins that add up to amount `a`. The last coin used is some `c`, and the rest must be the best way to make `a − c`:

`dp[a] = 1 + min over coins c ≤ a of dp[a − c]`, with `dp[0] = 0`, and ∞ when no coin fits.

Fill `a = 1, 2, …, amount` in order. Every `dp[a − c]` is to the left, so it is already final. The arrows show each coin's look-back; the best one wins.

**Why not greedy?** With coins `[1, 3, 4]` and amount 6, greedy takes 4 + 1 + 1 (3 coins), but 3 + 3 (2 coins) is better. DP tries every last coin instead of committing to the biggest.

To list the coins, walk back: from `amount`, pick any coin `c` with `dp[amount − c] = dp[amount] − 1` and repeat.

**Invariant:** after processing amount `a`, `dp[0..a]` hold the optimal coin counts.

## Complexity
| | Time | Space |
|---|---|---|
| A = amount, k coins | O(A · k) | O(A) |

## When to use
- "Fewest items to reach exactly X" with unlimited reuse (unbounded knapsack, minimisation).
- Counting variants: Coin Change II (combinations, coins outer loop) vs Combination Sum IV (orderings, amount outer loop).
- If amounts are huge but coins few, BFS over amounts can also work.

## Pitfalls
- Use a real infinity (or `amount + 1`) and check it before adding 1.
- Return `-1` when `dp[amount]` is still ∞.
- Greedy works only for "canonical" coin systems like 1, 5, 10, 25 — never assume it.

## Template
```python
def coin_change(coins, amount):
    dp = [0] + [float('inf')] * amount
    for a in range(1, amount + 1):
        dp[a] = min((dp[a - c] + 1 for c in coins if c <= a), default=float('inf'))
    return -1 if dp[amount] == float('inf') else dp[amount]
```
