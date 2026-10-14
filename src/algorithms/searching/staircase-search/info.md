## Explanation
When each row is sorted left→right and each column top→bottom (but rows may overlap), the matrix isn't one sorted list. The **top-right corner** is special: it is the largest value in its row and the smallest in its column. Comparing it with the target always eliminates a full line:

- `value > target`: everything below in this column is even bigger → drop the column (`c −= 1`).
- `value < target`: everything to the left in this row is even smaller → drop the row (`r += 1`).

The search walks a staircase from the top-right towards the bottom-left, touching at most `R + C` cells. The bottom-left corner works too (with the directions mirrored); the top-left does not, because both moves would increase the value.

**Invariant:** the target, if present, lies in the sub-matrix of rows `r..R−1` and columns `0..c`.

## Complexity
| | Time | Space |
|---|---|---|
| Staircase | O(R + C) | O(1) |
| Binary search every row | O(R log C) | O(1) |

## When to use
- Matrices sorted along both rows and columns (Young tableaux).
- Counting how many entries are ≤ x (walk the boundary and add row lengths) — the building block for k-th smallest in a sorted matrix.

## Pitfalls
- Starting at the top-left or bottom-right corner: neither move direction is decisive there.
- Forgetting the bounds check order in the loop (`r < R` before reading `matrix[r]`).
- Using the flattened binary search on this weaker ordering gives wrong answers.

## Template
```python
r, c = 0, C - 1
while r < R and c >= 0:
    if m[r][c] == t: return True
    if m[r][c] > t: c -= 1
    else: r += 1
return False
```
