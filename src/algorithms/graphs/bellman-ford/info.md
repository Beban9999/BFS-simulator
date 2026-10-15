## Explanation
Bellman-Ford makes no assumptions about weight signs. It repeats one simple pass: **relax every edge** `u → v` (if `dist[u] + w < dist[v]`, lower `dist[v]`).

Why V − 1 passes? A shortest path without cycles has at most V − 1 edges. After pass `k`, every node whose shortest path uses at most `k` edges already has its correct distance, because pass `k` extends the correct paths from pass `k − 1` by one edge. So V − 1 passes are enough. If a whole pass changes nothing, the distances are already final and the loop can stop early.

If a **negative cycle** can be reached from the source, distances can drop forever, so "shortest" is undefined. One extra pass detects this: if any edge can still be relaxed after V − 1 passes, such a cycle exists.

The order of the edge list affects how many passes are needed, but never the final answer.

**Invariant:** after `k` passes, `dist[v]` ≤ the length of the shortest path to `v` that uses at most `k` edges.

## Complexity
| | Time | Space |
|---|---|---|
| V − 1 passes over E edges | O(V·E) | O(V) |
| Best case (early exit) | O(E) | O(V) |

## When to use
- Negative edge weights (Dijkstra is wrong there).
- Detecting negative cycles (currency arbitrage, inconsistent constraints).
- "At most k edges / stops" limits: run exactly k passes, relaxing from a **copy** of the previous pass.
- Works straight from an edge list; no adjacency structure needed.

## Pitfalls
- For "at most k edges", updating `dist` in place lets one pass chain several edges; use the previous pass's array.
- `inf + w` must stay infinite: skip edges whose `dist[u]` is ∞ (important with integer sentinels).
- An undirected edge with a negative weight is already a negative cycle (u → v → u).
- A negative cycle that the source cannot reach does not affect the answer, and the check won't report it.

## Template
```python
def bellman_ford(n, edges, src):
    dist = [float('inf')] * n
    dist[src] = 0
    for _ in range(n - 1):
        new = dist[:]                 # copy → "at most k edges" semantics
        for u, v, w in edges:
            if dist[u] + w < new[v]:
                new[v] = dist[u] + w
        dist = new
    return dist
```
