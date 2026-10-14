## Explanation
A clockwise quarter turn sends the cell at `(r, c)` to `(c, n − 1 − r)`. Doing that move directly needs a 4-way cycle of swaps per group of cells. A cleaner route splits it into two simple, in-place steps:

1. **Transpose** — swap `(r, c)` with `(c, r)` for every cell above the diagonal. Now `(r, c)` holds what was at `(c, r)`.
2. **Reverse each row** — `(r, c)` ↔ `(r, n − 1 − c)`.

Composed, the cell that started at `(r, c)` lands at `(c, n − 1 − r)`: exactly the clockwise rotation. For **counter-clockwise**, transpose and then reverse each **column** (or reverse rows first, then transpose).

**Invariant:** after step 1, `matrix` is the transpose of the original; step 2 never moves a value to a different row.

## Complexity
| | Time | Space |
|---|---|---|
| Transpose + reverse | O(n²) | O(1) |
| Copy into a new matrix | O(n²) | O(n²) |

## When to use
- Rotating square images/boards in place (90°, 180° = two rotations or reverse rows + reverse columns, 270°).
- Any "flip / mirror / transpose" combination: think of each as a simple swap and compose them.

## Pitfalls
- Transposing with `c` starting at `0` swaps every pair **twice** and undoes itself — start at `r + 1`.
- In-place transpose only works for **square** matrices; an `R × C` matrix needs a new `C × R` result.
- Mixing up the order for counter-clockwise rotation.

## Template
```python
def rotate_clockwise(m):
    n = len(m)
    for r in range(n):
        for c in range(r + 1, n):
            m[r][c], m[c][r] = m[c][r], m[r][c]
    for row in m:
        row.reverse()
```
