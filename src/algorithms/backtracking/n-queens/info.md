## Explanation
Place n queens on an n×n board so that no two share a row, column or diagonal. Since every row holds exactly one queen, the search places them **row by row**: at row `r`, try each column `c`, recurse to row `r + 1`, and remove the queen when the call returns.

Three sets make the safety check O(1):
- `cols` holds the columns already used;
- `diag` holds `r − c` for each queen — all squares on one "\\" diagonal share this value;
- `anti` holds `r + c` — constant along each "/" diagonal.

A square whose column or either diagonal is taken is skipped immediately. These are the greyed branches in the tree; the queen it conflicts with is outlined on the board. A branch dies when some row has no safe square left, and the search backtracks to the row above. Reaching `r == n` means all n queens are placed: a solution.

**Invariant:** the queens on rows `0..r−1` never attack each other, and the three sets contain exactly their columns and diagonals.

## Complexity
| | Time | Space |
|---|---|---|
| n×n board | O(n!) upper bound (far less in practice thanks to the diagonal cuts) | O(n) sets + recursion, O(n²) board |

Solutions: n = 4 → 2, n = 5 → 10, n = 6 → 4, n = 8 → 92.

## When to use
- Placement puzzles with "one per row" structure and pairwise conflicts.
- The `r − c` / `r + c` diagonal keys show up in many grid problems.
- Bitmasks instead of sets make the count-only version (N-Queens II) very fast.

## Pitfalls
- Diagonal keys: `r − c` can be negative — fine for a set, but offset it by `n − 1` if you use an array.
- Undo **everything** a choice changed (board cell and all three sets).
- Build the result strings at the moment of recording; the board is mutated afterwards.

## Template
```python
def n_queens(n):
    cols, d1, d2, res, q = set(), set(), set(), [], []
    def place(r):
        if r == n:
            res.append(q[:]); return
        for c in range(n):
            if c in cols or r - c in d1 or r + c in d2: continue
            cols.add(c); d1.add(r - c); d2.add(r + c); q.append(c)
            place(r + 1)
            cols.remove(c); d1.remove(r - c); d2.remove(r + c); q.pop()
    place(0)
    return res
```
