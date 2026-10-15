## Explanation
A robot starts at the top-left and may only move **right** or **down**. Any path into cell `(r, c)` arrives either from the cell above or from the cell to the left, and those two sets of paths don't overlap. So

`dp[r][c] = dp[r − 1][c] + dp[r][c − 1]`

with `dp[0][0] = 1`. Cells outside the grid count as 0. An **obstacle** gets 0 paths; because later cells add up their neighbours, a blocked cell automatically cuts off everything that could only be reached through it.

Filling row by row, left to right, guarantees that the cell above and the cell to the left are already done. The two arrows show them.

**Invariant:** once filled, `dp[r][c]` is the number of right/down paths from the start to `(r, c)` that avoid obstacles.

## Complexity
| | Time | Space |
|---|---|---|
| m×n grid | O(m·n) | O(m·n), or O(n) keeping one row |

Without obstacles the answer is also the binomial coefficient C(m + n − 2, m − 1).

## When to use
- Counting monotone lattice paths, with or without blocked cells.
- Template for every "grid DP from top-left": min path sum, max gold collected, dungeon game (bottom-right to top-left).
- One-row trick: `row[c] += row[c − 1]` sweeping left to right.

## Pitfalls
- Start or end on an obstacle → the answer is 0.
- The first row and column are **not** all 1 when there are obstacles; let the formula handle them.
- Big grids overflow 32-bit ints in typed languages.
- Allowing up/left moves too breaks the DP order (cycles); that's a graph search instead.

## Template
```python
def unique_paths(grid):
    n = len(grid[0])
    row = [0] * n
    row[0] = 1
    for line in grid:
        for c in range(n):
            if line[c] == 1:
                row[c] = 0
            elif c > 0:
                row[c] += row[c - 1]
    return row[-1]
```
