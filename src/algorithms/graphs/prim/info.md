## Explanation
Prim's algorithm grows a **single tree** from a start node. At every step it adds the cheapest edge with exactly one end in the tree, which pulls in one new node.

This page uses the **lazy** version, the Dijkstra-like loop with a heap of candidate edges `(weight, node, from)`. When a node joins the tree, all its edges to nodes outside the tree are pushed. Popping gives the cheapest candidate. If its node already joined through a cheaper edge, the entry is **stale** and is skipped.

It is correct for the same reason as Kruskal (the **cut property**): the cheapest edge crossing the cut between "tree" and "not yet in the tree" is always safe to add.

Compared with Dijkstra, the only change is the key: Prim uses the **edge weight** `w`, while Dijkstra uses the path length `dist[u] + w`.

**Invariant:** the tree nodes and chosen edges always form a subtree of some minimum spanning tree.

## Complexity
| | Time | Space |
|---|---|---|
| Lazy heap (this page) | O(E log E) | O(E) heap |
| Array of best edges (no heap) | O(V²) — best for dense / complete graphs | O(V) |

## When to use
- MST of a dense graph, especially complete graphs defined by point coordinates (O(V²) array version).
- When adjacency lists already exist (Kruskal wants a sorted edge list).
- Growing a network outward from a fixed root.

## Pitfalls
- Prim from one start only spans that start's component; check that every node was added.
- Don't confuse it with Dijkstra: push `w`, not `dist[u] + w`.
- Without the stale check, a node can be added twice and the total is wrong.
- Undirected graphs only.

## Template
```python
import heapq

def prim(n, graph):
    seen, heap, total = set(), [(0, 0)], 0
    while heap and len(seen) < n:
        w, u = heapq.heappop(heap)
        if u in seen:
            continue
        seen.add(u)
        total += w
        for v, wv in graph[u]:
            if v not in seen:
                heapq.heappush(heap, (wv, v))
    return total if len(seen) == n else -1
```
