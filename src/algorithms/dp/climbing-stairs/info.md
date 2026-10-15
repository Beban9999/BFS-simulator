## Explanation
To reach step `n` your last move was either 1 step (from `n − 1`) or 2 steps (from `n − 2`), so `ways(n) = ways(n − 1) + ways(n − 2)`, with `ways(0) = ways(1) = 1`. Use the **View** select to see the four classic stages of turning a recurrence into DP:

1. **Recursion.** Translate the formula directly. The call tree shows **overlapping subproblems**: `ways(2)` is computed over and over. The "times computed" row counts it. The tree has about φⁿ nodes (φ ≈ 1.618), so it is exponential.
2. **Memoisation (top-down).** Same recursion, but each answer is stored in `memo` the first time. Every later call for the same `n` is a **cache hit** (green leaf) and returns immediately. Each `n` is now computed once: O(n).
3. **Tabulation (bottom-up).** Turn the recursion inside out. Fill `dp[0..n]` from the base cases upward, in an order where every cell's dependencies (the arrows) are already filled. No recursion, no stack.
4. **Two variables.** Each cell only reads the two before it, so keep just those two values (`a`, `b`) and slide them forward. O(1) space.

**Invariant (table):** when `dp[i]` is written, `dp[0..i−1]` already hold the correct counts.

## Complexity
| View | Time | Space |
|---|---|---|
| Recursion | O(φⁿ) ≈ O(1.618ⁿ) | O(n) stack |
| Memoisation | O(n) | O(n) memo + O(n) stack |
| Tabulation | O(n) | O(n) |
| Two variables | O(n) | O(1) |

## When to use
- The recipe for every DP: write the recurrence → check that subproblems overlap → memoise → (optionally) tabulate → shrink the table to what's actually read.
- Memoisation is the fastest to write and only touches reachable states. Tabulation avoids recursion limits and enables space tricks.

## Pitfalls
- Base cases: here `ways(0) = 1` (one way to stand still), which makes `ways(2) = 2` come out right.
- Python's `@lru_cache` / `@cache` is the quickest memo; beware mutable default arguments if you write the dict yourself.
- Space optimisation needs a fill order where old values are no longer needed (here: keep the previous two).

## Template
```python
from functools import cache

@cache
def ways(n):
    return 1 if n <= 1 else ways(n - 1) + ways(n - 2)
```
