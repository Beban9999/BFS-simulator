## Explanation
Try every cell as the start of the word. `dfs(r, c, i)` asks whether `word[i:]` can be spelled starting at `(r, c)`:

1. If the cell is off the board or its letter isn't `word[i]`, fail (greyed branches).
2. If it is the last letter, success.
3. Otherwise **mark** the cell (`'#'`), so the path can't use it twice, and try the four neighbours for `word[i + 1]`.
4. **Restore** the letter before returning, so other paths can use the cell again.

Step 4 is what makes this backtracking rather than plain DFS. A cell is "visited" only while it is on the **current** path, not forever. A cell abandoned by one path may still belong to the answer through a different route.

**Invariant:** the marked cells are exactly the cells of the current path, and they spell `word[:i]`.

## Complexity
| | Time | Space |
|---|---|---|
| R×C board, word length L | O(R·C · 3^L) (after the first step each cell has at most 3 unvisited neighbours) | O(L) recursion |

## When to use
- Paths on a grid where a cell may not be reused **within one path** but may be reused **across** paths (boggle, gold collecting).
- When a global `visited` set would wrongly block cells, mark on entry and unmark on exit.
- Pruning tricks: check letter counts first; start from the rarer end of the word.

## Pitfalls
- Forgetting to restore the cell: later starts see `'#'` and miss valid words.
- Stopping too late: `or`-chaining (or an early return) stops exploring as soon as one direction succeeds.
- A global visited set (like plain BFS/DFS) gives wrong answers here.
- Check the bounds before reading `board[r][c]`.

## Template
```python
def dfs(r, c, i):
    if not (0 <= r < R and 0 <= c < C) or board[r][c] != word[i]:
        return False
    if i == len(word) - 1:
        return True
    board[r][c], keep = '#', board[r][c]
    ok = any(dfs(r + dr, c + dc, i + 1) for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)))
    board[r][c] = keep
    return ok
```
