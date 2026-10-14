## Explanation
If a cell is 0, its whole row and column must become 0. Zeroing immediately is wrong: the new zeros would wipe out more rows and columns. So first **record** which rows and columns contain a zero, then **fill**.

The easy version keeps two sets (rows, columns): O(R + C) extra space. The O(1) version stores those sets *inside the matrix*: `matrix[r][0]` marks row `r` and `matrix[0][c]` marks column `c`. Because the first row and column are being reused as markers, remember up front (two booleans) whether they originally contained a zero, and zero them **last**.

**Invariant:** after step 1, `matrix[r][0] == 0` iff row `r` (r ≥ 1) had a zero, and `matrix[0][c] == 0` iff column `c` (c ≥ 1) had a zero.

## Complexity
| | Time | Space |
|---|---|---|
| Marker version | O(R · C) | O(1) |
| Row/column sets | O(R · C) | O(R + C) |

## When to use
- In-place grid updates where each cell's new value depends on the *old* state of a whole row/column.
- The general trick: reuse part of the input (first row/column, sign bit, unused high bits) as scratch space.

## Pitfalls
- Zeroing cells during the scan cascades zeros everywhere.
- Filling the first row/column before the inner cells destroys the markers.
- `matrix[0][0]` is shared by row 0 and column 0 — that's why two separate booleans are needed.

## Template
```python
rows, cols = set(), set()
for r in range(R):
    for c in range(C):
        if m[r][c] == 0:
            rows.add(r); cols.add(c)
for r in range(R):
    for c in range(C):
        if r in rows or c in cols:
            m[r][c] = 0
```
