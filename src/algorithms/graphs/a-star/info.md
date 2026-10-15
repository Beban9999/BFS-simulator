## Explanation
BFS and Dijkstra spread out evenly in every direction, even away from the target. A* adds a **heuristic** `h(cell)`, an estimate of the remaining distance to the goal, and always expands the open cell with the smallest

`f = g + h` (cost so far + estimated cost to go).

On a 4-direction grid with unit steps, the **Manhattan distance** `|dr| + |dc|` never overestimates the true remaining cost (it is **admissible**), and it never drops by more than 1 per step (it is **consistent**). With such a heuristic, the first time the goal is popped, its path is shortest, and no cell ever needs to be expanded twice. Ties in `f` are broken toward the smaller `h` (closer to the goal), which keeps the search narrow on open grids.

Labels show each discovered cell's `f`. Compare the number of expanded cells with the BFS page on the same grid.

**Invariant:** the `f` values popped from the heap never decrease, and every closed cell's `g` is its true distance from the start.

## Complexity
| | Time | Space |
|---|---|---|
| Worst case (useless heuristic, h = 0) | same as Dijkstra, O(E log V) | O(V) |
| Good heuristic | far fewer expansions in practice | O(V) |

## When to use
- One source and **one** target with a meaningful distance estimate: maps, grids, puzzles (8-puzzle, sliding tiles).
- Game pathfinding (often with weighted or diagonal moves; use octile/Chebyshev distance for 8 directions).
- With `h = 0` it **is** Dijkstra; with all-unit edges and `h = 0` it behaves like BFS.

## Pitfalls
- An **overestimating** heuristic (e.g. Manhattan × 2) is faster but can return a non-shortest path.
- Manhattan distance is not admissible if diagonal moves are allowed; use Chebyshev or octile distance.
- With an inconsistent heuristic, closed cells may need reopening; the closed-set shortcut is only safe for consistent ones.
- A* only helps for a single target; for all distances from a source, use BFS / Dijkstra.

## Template
```python
import heapq

def a_star(start, goal, neighbours, h):
    g, heap, closed = {start: 0}, [(h(start), start)], set()
    while heap:
        _, u = heapq.heappop(heap)
        if u in closed:
            continue
        if u == goal:
            return g[u]
        closed.add(u)
        for v, w in neighbours(u):
            if g[u] + w < g.get(v, float('inf')):
                g[v] = g[u] + w
                heapq.heappush(heap, (g[v] + h(v), v))
    return -1
```
