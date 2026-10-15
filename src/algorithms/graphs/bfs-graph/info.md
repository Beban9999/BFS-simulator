## Explanation
BFS on a graph is the same idea as on a grid, with the neighbours read from an **adjacency list** instead of four directions. A FIFO queue holds discovered nodes in the order they were found, so all nodes at distance `d` leave the queue before any node at distance `d + 1`.

The first time a node is discovered, it is reached through a fewest-edges path, so `dist[v] = dist[u] + 1` is final the moment it is written. The edges that discover nodes form the **BFS tree** (drawn in the path colour); following parents up that tree from any node gives a shortest path back to the source.

On a directed graph, only outgoing edges are followed, so some nodes may stay unreached even if an edge points *into* them. Unreached nodes keep no distance.

**Invariant:** the queue holds nodes from at most two consecutive layers, `d` then `d + 1`, in non-decreasing order of `dist`.

## Complexity
| | Time | Space |
|---|---|---|
| Adjacency list, V nodes, E edges | O(V + E) | O(V) for `dist` + queue |
| Adjacency matrix | O(V²) | O(V) |

Each node is enqueued once, and each edge is scanned once (twice for undirected graphs, once from each end).

## When to use
- Fewest edges / fewest moves between states when every move costs the same.
- "Is B reachable from A?" (DFS works too; BFS also gives the distance).
- Level-by-level processing: distance-k nodes, spreading over time, layers of a dependency graph.
- Many sources at once (multi-source BFS): put them all in the queue with distance 0.

## Pitfalls
- Mark a node as seen **when it is enqueued**, not when it is popped, or it can enter the queue several times.
- On weighted graphs BFS distances are wrong; use Dijkstra (non-negative weights) or 0-1 BFS (weights 0/1).
- Disconnected graphs: one BFS only covers the source's component; loop over all nodes if you need every component.
- Building the adjacency list from an undirected edge list must add both `u→v` and `v→u`.

## Template
```python
from collections import deque

def bfs(graph, source):
    dist = {source: 0}
    queue = deque([source])
    while queue:
        u = queue.popleft()
        for v in graph[u]:
            if v not in dist:
                dist[v] = dist[u] + 1
                queue.append(v)
    return dist
```
