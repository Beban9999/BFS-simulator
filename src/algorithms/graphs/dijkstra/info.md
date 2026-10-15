## Explanation
Dijkstra generalises BFS to edges with **non-negative weights**. It keeps a tentative distance for every node (∞ at first, 0 for the source) and a min-heap of `(distance, node)` candidates.

Each round pops the candidate with the smallest distance. Because all weights are ≥ 0, no path through any other unsettled node can be shorter, so that distance is **final** and the node is settled. Then it **relaxes** each outgoing edge `u → v` of weight `w`: if `dist[u] + w < dist[v]`, a shorter route to `v` has been found, so update `dist[v]` and push the new candidate.

Python's `heapq` has no decrease-key, so a node can sit in the heap several times. The older, larger entries are **stale** and are skipped when popped (`d > dist[u]`). The yellow edges are the current shortest-path tree (each node's best predecessor).

**Invariant:** every settled node's `dist` is its true shortest distance, and every settled distance ≤ every distance still in the heap.

## Complexity
| | Time | Space |
|---|---|---|
| Binary heap (this page) | O((V + E) log V) | O(V + E) heap with stale entries |
| Array scan instead of a heap | O(V²) — better for dense graphs | O(V) |

## When to use
- Single-source shortest paths with non-negative weights: road networks, latency, costs.
- Grids where moves have different costs, or the "cost" is a max/min along the path (minimum effort).
- Stop as soon as the target is popped if you only need one destination.
- Negative edges → Bellman-Ford; all weights equal → BFS; weights 0/1 → 0-1 BFS.

## Pitfalls
- Negative weights silently produce wrong answers (a settled node could still improve).
- Don't skip the stale check: without it the algorithm stays correct but may do far more work.
- Marking nodes visited when **pushed** (as in BFS) is wrong here; a node is final only when **popped**.
- Overflow / infinity: use `float('inf')` in Python, a large sentinel in Java/C++.

## Template
```python
import heapq

def dijkstra(graph, src):
    dist = {src: 0}
    heap = [(0, src)]
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist.get(u, float('inf')):
            continue
        for v, w in graph[u]:
            nd = d + w
            if nd < dist.get(v, float('inf')):
                dist[v] = nd
                heapq.heappush(heap, (nd, v))
    return dist
```
