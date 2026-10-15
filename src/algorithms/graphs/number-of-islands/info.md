## Explanation
A grid is an implicit graph: every land cell is a node, joined to the land cells directly above, below, left and right. An **island** is a connected component of that graph, so counting islands means counting components.

Scan the cells in reading order. Whenever the scan meets land that no search has claimed yet, it is the first cell of a **new island**: increase the count and run a DFS from it. The DFS claims every land cell reachable from there, so the scan will never start a second search inside the same island. Letting the DFS return `1 + (areas of its four calls)` gives each island's size for free.

**Invariant:** after the scan passes a cell, that cell is either water or belongs to an island that has already been counted and fully claimed.

## Complexity
| | Time | Space |
|---|---|---|
| R×C grid | O(R·C) | O(R·C) for `seen` + recursion depth up to R·C |

Each cell is claimed once and looked at from at most 4 neighbours.

## When to use
- Count / size / shape of connected regions on a grid ("islands", "provinces", "blobs").
- Any "flood" question: fill, sink, capture, colour a region.
- When the problem allows it, overwrite land with `'0'` instead of keeping `seen` — saves memory.
- BFS or Union-Find work equally well; Union-Find wins if land is added over time (Number of Islands II).

## Pitfalls
- Check bounds **before** reading `grid[r][c]`.
- Mark a cell as seen before recursing into neighbours, or two neighbours recurse into each other forever.
- A 300×300 all-land grid recurses 90 000 deep — too much for Python's default limit; use an explicit stack or BFS.
- Diagonal cells are **not** neighbours unless the problem says so.

## Template
```python
def components(grid):
    rows, cols, seen = len(grid), len(grid[0]), set()
    def dfs(r, c):
        if not (0 <= r < rows and 0 <= c < cols) or grid[r][c] != '1' or (r, c) in seen:
            return 0
        seen.add((r, c))
        return 1 + sum(dfs(r + dr, c + dc) for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)))
    return [dfs(r, c) for r in range(rows) for c in range(cols)
            if grid[r][c] == '1' and (r, c) not in seen]
```
