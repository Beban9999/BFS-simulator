## Explanation
Depth-first search commits to one direction and keeps going until it hits a dead end, then **backtracks** to the most recent cell that still has unexplored neighbours. An explicit **stack** (or the call stack, in the recursive version) remembers where to come back to.

DFS answers "is the end reachable?" and "which cells are connected to this one?" with very little bookkeeping. The path it finds is just the route it happened to take — usually long and winding, never guaranteed to be shortest.

**Invariant:** the stack holds the cells discovered but not yet explored; the cell on top is always the most recently discovered one, so the search dives deeper before it widens.

This iterative version marks a cell **done when it is popped**, so a cell can sit in the stack more than once; stale copies are skipped. That makes its exploration order identical to the recursive version.

## Complexity
| | Time | Space |
|---|---|---|
| Grid with R×C cells | O(R·C) | O(R·C) stack in the worst case (a long snake) |
| Graph with V vertices, E edges | O(V + E) | O(V) |

## When to use
- Reachability, "is there a path", counting **connected components** (islands, provinces).
- Exhaustively exploring a region: flood fill, area of an island, marking cells reachable from the border.
- Anything that needs post-order information (cycle detection, topological sort) — see the graph pages.
- Not for shortest paths in unweighted graphs: use BFS.

## Pitfalls
- Recursive DFS on a 1000×1000 grid can exceed the recursion limit (Python default is 1000). Use an explicit stack or raise the limit.
- Mark visited consistently: either on push (fewer stack entries) or on pop (matches recursion order). Mixing the two causes revisits.
- Push neighbours in **reverse** if you want the iterative version to explore in the same order as the recursive one.
- Don't expect the DFS path to be short — report it as "a path", not "the shortest path".

## Template
```python
def dfs(start):
    stack, seen = [start], set()
    while stack:
        node = stack.pop()
        if node in seen:
            continue
        seen.add(node)
        visit(node)
        for nxt in reversed(neighbors(node)):
            if nxt not in seen:
                stack.append(nxt)

# recursive form
def dfs_rec(node, seen):
    seen.add(node)
    for nxt in neighbors(node):
        if nxt not in seen:
            dfs_rec(nxt, seen)
```
