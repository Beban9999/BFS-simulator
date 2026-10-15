## Explanation
Problems usually hand you a graph as an **edge list** (`[[u, v], ...]`), which is compact but slow to query. Before running any traversal you convert it:

- **Adjacency lists** — `adj[u]` holds the neighbours of `u`. Iterating a node's neighbours costs exactly its degree, so BFS/DFS run in O(V + E). This is the default choice.
- **Adjacency matrix** — `matrix[u][v] = 1` (or the weight) when the edge exists. Edge checks are O(1), but the matrix always takes V² space and listing a node's neighbours costs O(V). Good for small dense graphs and for Floyd–Warshall.

An undirected edge is stored **twice** (u→v and v→u), so the matrix is symmetric and the lists hold 2E entries. A directed edge is stored once; the matrix row is the out-edges, the column the in-edges.

**Invariant:** after processing k edges, `adj` and `matrix` describe exactly the subgraph made of those k edges.

## Complexity
| | Space | Edge check | Neighbours of u | Add edge |
|---|---|---|---|---|
| Edge list | O(E) | O(E) | O(E) | O(1) |
| Adjacency lists | O(V + E) | O(deg u) | O(deg u) | O(1) |
| Adjacency matrix | O(V²) | O(1) | O(V) | O(1) |

Use a list of **sets** if you need both fast iteration and O(1) edge checks.

## When to use
- Edge list: input format, Kruskal (sort the edges), Bellman-Ford (relax every edge).
- Adjacency lists: BFS, DFS, Dijkstra, topological sort — almost everything.
- Matrix: dense graphs, V ≤ a few hundred, Floyd–Warshall, quick "is there an edge" lookups.
- Implicit graphs (grids, word ladders, states): no structure at all; generate neighbours on the fly.

## Pitfalls
- Forgetting the reverse edge for undirected input is the most common graph bug.
- Nodes with no edges still need an (empty) list; build `adj` with `n` entries, not from the edges.
- Labels that are not 0..n-1 (strings, large ids) need a dict `defaultdict(list)` or a relabelling map.
- A V² matrix for V = 10⁵ needs 10¹⁰ cells — check constraints before choosing it.

## Template
```python
from collections import defaultdict

def build(edges, directed=False):
    adj = defaultdict(list)
    for u, v in edges:
        adj[u].append(v)
        if not directed:
            adj[v].append(u)
    return adj
```
