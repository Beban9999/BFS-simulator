## Explanation
The 2D prefix table `P` has one extra row and column of zeros. `P[r+1][c+1]` is the sum of every cell in the rectangle from `(0, 0)` to `(r, c)`.

**Building** a cell uses inclusion–exclusion: take the cell's value, add the rectangle above (`P[r][c+1]`) and the rectangle to the left (`P[r+1][c]`), and subtract the overlap they both counted (`P[r][c]`).

**Querying** the rectangle `(r1, c1)–(r2, c2)` reverses that: start from the big rectangle `P[r2+1][c2+1]`, subtract the strip above and the strip to the left, then add back the corner that was subtracted twice. Four lookups, whatever the rectangle's size.

**Invariant:** `P[i][j]` = sum of `matrix[0..i-1][0..j-1]`; row 0 and column 0 of `P` are all zeros.

## Complexity
| | Time | Space |
|---|---|---|
| Build | O(R · C) | O(R · C) |
| Each rectangle query | O(1) | — |
| Summing the rectangle directly | O(area) per query | O(1) |

## When to use
- Many rectangle-sum queries on a static grid (images: "summed-area table" / "integral image").
- Block sums around every cell, counting 1s in sub-grids, checking if a square region is empty.
- Reduce 2D problems to 1D by fixing a pair of rows and using column prefix sums.

## Pitfalls
- Off-by-one: query uses `r2 + 1`/`c2 + 1` for the far corner and plain `r1`/`c1` for the near one.
- Forgetting to **add back** the top-left corner `P[r1][c1]`.
- For a mutable grid, use a 2D Fenwick tree instead.

## Template
```python
P = [[0] * (C + 1) for _ in range(R + 1)]
for r in range(R):
    for c in range(C):
        P[r+1][c+1] = m[r][c] + P[r][c+1] + P[r+1][c] - P[r][c]
rect = lambda r1, c1, r2, c2: P[r2+1][c2+1] - P[r1][c2+1] - P[r2+1][c1] + P[r1][c1]
```
