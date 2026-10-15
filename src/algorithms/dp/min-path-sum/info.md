## Explanation
Moving only right or down from the top-left, find the path with the smallest total of cell values. Every path into `(r, c)` comes from above or from the left, so the cheapest one comes from the **cheaper** of those two:

`dp[r][c] = grid[r][c] + min(dp[r − 1][c], dp[r][c − 1])`

The first row can only be entered from the left and the first column only from above, so those cells add along their single option.

The arrows show the two candidates for each cell. After the table is full, **walk back** from the bottom-right, always stepping to the neighbour (up or left) with the smaller `dp`. That neighbour is where the optimum came from, and the walk traces the cheapest path (yellow).

**Invariant:** every filled `dp[r][c]` is the minimum path sum from the start to `(r, c)`.

## Complexity
| | Time | Space |
|---|---|---|
| m×n grid | O(m·n) | O(m·n) (O(n) with one row, but then no path) |

## When to use
- Optimise a total over monotone (right/down) grid paths: cost, gold, score.
- The same table + walk-back pattern recovers the actual choices in any DP.
- With moves in all directions or negative cycles it becomes a shortest-path problem (Dijkstra).

## Pitfalls
- First row and first column have only one parent; handle them before the general case.
- Updating in place (reusing `grid` as `dp`) is fine if the input may be modified.
- Ties in the walk back: either neighbour gives an optimal path.

## Template
```python
def min_path_sum(grid):
    n = len(grid[0])
    row = [float('inf')] * n
    row[0] = 0
    for line in grid:
        for c in range(n):
            row[c] = line[c] + (row[c] if c == 0 else min(row[c], row[c - 1]))
    return row[-1]
```
