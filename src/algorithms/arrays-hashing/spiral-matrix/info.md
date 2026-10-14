## Explanation
Spiral order peels the matrix like an onion. Four boundaries — `top`, `bottom`, `left`, `right` — describe the ring that is still unread. Each lap reads the top row left→right, the right column top→bottom, the bottom row right→left and the left column bottom→top, moving the matching boundary inward after each leg.

The only subtle part is non-square matrices: after the first two legs, the remaining area may be a single row or a single column. Re-checking `top <= bottom` before the left leg and `left <= right` before the up leg stops the same cells from being read twice.

**Invariant:** at the top of the loop, the unread cells are exactly the rectangle `[top..bottom] × [left..right]`.

## Complexity
| | Time | Space |
|---|---|---|
| All cases | O(R · C) | O(1) besides the output |

## When to use
- Spiral reading or writing (Spiral Matrix I/II), printing a matrix layer by layer.
- Layer-by-layer processing in general — rotating a matrix in place by layers uses the same four boundaries.
- Simulations that walk a grid while turning: keep a direction index and turn when the next cell is out of bounds or visited.

## Pitfalls
- Missing the re-checks duplicates the middle row or column on rectangles like 3×4 or 4×1.
- Mixing up which boundary moves after which leg: top after the top row, right after the right column, and so on.
- Empty matrix (`[]` or `[[]]`) needs a guard before reading `matrix[0]`.

## Template
```python
top, bottom, left, right = 0, R - 1, 0, C - 1
while top <= bottom and left <= right:
    # read top row, right col, (if rows remain) bottom row, (if cols remain) left col
    ...
```
