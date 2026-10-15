## Explanation
Flood fill is BFS (or DFS) over the cells that share the start cell's **old colour**. Paint the start cell, then repeatedly take a painted cell from the queue and paint any up/down/left/right neighbour that still has the old colour.

The colour itself is the "visited" marker. Once a cell is repainted it no longer matches `old`, so it can never be queued twice. That is why the early return matters: if the new colour **equals** the old one, painting changes nothing, cells keep matching `old`, and the search would loop forever.

**Invariant:** every cell in the queue has already been painted, and every painted cell is connected to the start through painted cells.

## Complexity
| | Time | Space |
|---|---|---|
| R×C image | O(R·C) | O(R·C) queue (or recursion) in the worst case |

## When to use
- Recolour, fill, or measure a single connected region from a known start cell.
- The same "mutate the grid as the visited set" trick works for islands, surrounded regions, and minesweeper reveals.
- Choose DFS for shorter code, BFS when the region can be huge (no recursion limit).

## Pitfalls
- `old == color` must return immediately (see above).
- Only 4-directional neighbours unless told otherwise.
- Paint when you **enqueue**, not when you dequeue, or cells are queued several times.
- Mutating the input may not be allowed; copy it first if the caller still needs the original.

## Template
```python
def fill(grid, r, c, old, new):
    if not (0 <= r < len(grid) and 0 <= c < len(grid[0])) or grid[r][c] != old:
        return
    grid[r][c] = new
    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        fill(grid, r + dr, c + dc, old, new)
```
