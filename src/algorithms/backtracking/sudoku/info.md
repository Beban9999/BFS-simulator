## Explanation
The solver scans for the **first empty cell** in reading order. For that cell it tries each digit. A digit is legal when it doesn't already appear in the cell's row, column or box; illegal digits show as greyed branches, with the clashing cell outlined on the board. Placing a legal digit and recursing either solves the rest of the board, which returns `True` all the way up, or fails. On failure, the digit is erased (**undo**) and the next one is tried.

If **no** digit fits a cell, an earlier choice was wrong: `return False` tells the caller to try its next digit. That is the backtrack, the moment a branch of the decision tree dies. Each level of the tree is one empty cell, and each node is labelled with the digit placed there.

This page accepts 4×4 boards (2×2 boxes) and 9×9 boards (3×3 boxes). The algorithm is identical; only the board size changes.

**Invariant:** the filled cells never contain two equal digits in a row, column or box.

## Complexity
| | Time | Space |
|---|---|---|
| m empty cells, n digits | O(n^m) worst case | O(m) recursion |

Real puzzles finish quickly because the clash checks cut most branches early.

## When to use
- Constraint satisfaction: fill slots with values under pairwise rules (Sudoku, KenKen, graph colouring, scheduling).
- Big speed-ups: keep **sets/bitmasks** per row, column and box (O(1) checks), and pick the empty cell with the **fewest** legal digits first (MRV heuristic) instead of the first one.

## Pitfalls
- Forgetting to reset the cell to `'.'` after a failed attempt leaves stale digits on the board.
- Returning `False` too early: only after **all** digits for that cell failed.
- Once `solve()` returns `True`, stop immediately — don't undo the solution.
- Box start is `r − r % box`, not `r // box`.

## Template
```python
def solve(board):
    for r in range(9):
        for c in range(9):
            if board[r][c] == '.':
                for d in '123456789':
                    if valid(board, r, c, d):
                        board[r][c] = d
                        if solve(board):
                            return True
                        board[r][c] = '.'
                return False
    return True
```
