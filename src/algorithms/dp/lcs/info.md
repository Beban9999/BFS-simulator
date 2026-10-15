## Explanation
`dp[i][j]` is the LCS length of the prefixes `a[:i]` and `b[:j]`. Row 0 and column 0 are empty prefixes, so they hold 0. For a cell, look at the **last characters** `a[i−1]` and `b[j−1]`:

- **Equal:** they can both end the common subsequence, so `dp[i][j] = dp[i−1][j−1] + 1` (diagonal arrow).
- **Different:** at least one of them is not used. Drop the last char of `a` (cell above) or of `b` (cell to the left) and keep the better: `dp[i][j] = max(dp[i−1][j], dp[i][j−1])`.

The answer is the bottom-right cell. To get the subsequence itself, **walk back** from the corner. A match means take the char and go diagonally; otherwise move toward the larger neighbour. The walked path is shown in yellow, and the taken characters, read in reverse, are the LCS.

**Invariant:** each filled `dp[i][j]` is the LCS length of `a[:i]` and `b[:j]`.

## Complexity
| | Time | Space |
|---|---|---|
| lengths m, n | O(m·n) | O(m·n), or O(min(m, n)) with two rows (length only) |

## When to use
- Similarity of two sequences: diff tools, DNA alignment, "minimum deletions to make equal".
- The two-string table (prefix × prefix) is the template for edit distance, distinct subsequences, interleaving strings, regex/wildcard matching.

## Pitfalls
- Off-by-one: `dp` is (m+1)×(n+1) and compares `a[i−1]`, `b[j−1]`.
- A subsequence is not a substring: for the longest common **substring**, reset to 0 on a mismatch and track the max.
- Several LCS strings may exist; the walk-back's tie rule picks one.

## Template
```python
def lcs(a, b):
    prev = [0] * (len(b) + 1)
    for ca in a:
        cur = [0]
        for j, cb in enumerate(b, 1):
            cur.append(prev[j - 1] + 1 if ca == cb else max(prev[j], cur[j - 1]))
        prev = cur
    return prev[-1]
```
