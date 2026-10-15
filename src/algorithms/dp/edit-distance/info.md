## Explanation
`dp[i][j]` = the fewest single-character edits that turn the prefix `a[:i]` into `b[:j]`. Turning a prefix into the empty string takes `i` deletions (column 0), and building `b[:j]` from nothing takes `j` insertions (row 0).

For other cells, look at the last characters:
- **Equal** (`a[i−1] == b[j−1]`): no edit needed, so `dp[i][j] = dp[i−1][j−1]`.
- **Different:** the last operation was one of
  - **replace** `a[i−1]` by `b[j−1]` → `dp[i−1][j−1] + 1` (diagonal),
  - **delete** `a[i−1]` → `dp[i−1][j] + 1` (from above),
  - **insert** `b[j−1]` → `dp[i][j−1] + 1` (from the left).

  Take the minimum.

The answer is `dp[m][n]`. Walking back from that corner along cells that explain each value gives the **alignment** shown at the end: `=` keep, `R` replace, `D` delete, `I` insert.

**Invariant:** each filled `dp[i][j]` is the edit distance between `a[:i]` and `b[:j]`.

## Complexity
| | Time | Space |
|---|---|---|
| lengths m, n | O(m·n) | O(m·n), O(n) with two rows (distance only) |

## When to use
- Spell checking, fuzzy search, DNA mutation distance, diff tools.
- Any "transform sequence A into B with weighted operations" problem: change the costs per operation.
- Early exit for "distance ≤ k" problems: only a band of width 2k around the diagonal matters.

## Pitfalls
- The base row/column are **not** zero (unlike LCS).
- Delete moves **up** (consumes a char of `a`), insert moves **left** (consumes a char of `b`) — easy to swap.
- Equal characters must take the diagonal for free; don't add 1.

## Template
```python
def edit_distance(a, b):
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(prev[j - 1] if ca == cb else 1 + min(prev[j - 1], prev[j], cur[j - 1]))
        prev = cur
    return prev[-1]
```
