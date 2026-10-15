## Explanation
A region of `O`s is **surrounded** when it cannot reach the edge of the board through other `O`s. Checking that region by region is awkward: you only learn a region is safe after exploring all of it. Flip the question instead. Any `O` connected to a **border** `O` is safe, and every other `O` is captured.

1. Walk the border. From each border `O`, run a DFS that marks its whole region with a temporary `S` (safe).
2. Sweep the whole board: an `O` that is still `O` was never reached from the border, so flip it to `X`. Turn each `S` back into `O`.

The temporary letter doubles as the visited set, so no extra memory is needed beyond the recursion.

**Invariant:** after phase 1, a cell is `S` exactly when its region touches the border.

## Complexity
| | Time | Space |
|---|---|---|
| R×C board | O(R·C) | O(R·C) recursion depth in the worst case (O(1) extra otherwise) |

## When to use
- "Capture / count / remove regions that do **not** touch the border" (enclaves, closed islands).
- Whenever one side of a yes/no condition is easy to grow from a known set — start from that set (here: the border).
- Same shape as Pacific Atlantic: search backwards from the boundary instead of forwards from every cell.

## Pitfalls
- Starting DFS from interior `O`s and trying to detect the border is error-prone; start from the border.
- Use a third symbol (or a `seen` set) — flipping to `X` during phase 1 destroys information.
- Recursion depth on a large all-`O` board; use BFS or an explicit stack if needed.
- Corners belong to two borders; the `board[r][c] == 'O'` check prevents double work.

## Template
```python
def capture(board):
    R, C = len(board), len(board[0])
    def safe(r, c):
        if 0 <= r < R and 0 <= c < C and board[r][c] == 'O':
            board[r][c] = 'S'
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                safe(r + dr, c + dc)
    for r in range(R):
        for c in range(C):
            if r in (0, R - 1) or c in (0, C - 1):
                safe(r, c)
    for row in board:
        for c, ch in enumerate(row):
            row[c] = 'O' if ch == 'S' else 'X'
```
