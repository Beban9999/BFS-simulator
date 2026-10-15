## Explanation
Floyd-Warshall computes the shortest distance between **every pair** of nodes with a three-line triple loop. Start with a matrix holding 0 on the diagonal, the edge weight where an edge exists, and ∞ elsewhere.

It is dynamic programming over "which nodes may be used as stopovers". After round `k`, `dist[i][j]` is the shortest path from `i` to `j` that only passes through intermediate nodes `0..k`. Round `k` asks one question per pair: is going `i → k → j` (using the best routes found so far for both halves) shorter than the current `i → j`?

In the matrix, row `k` and column `k` (highlighted) are the two halves being combined. They do not change during round `k` because `dist[k][k] = 0`, which is why updating the table in place is safe.

**Invariant:** after round `k`, `dist[i][j]` is the shortest `i → j` distance using only intermediates from `{0, …, k}`.

## Complexity
| | Time | Space |
|---|---|---|
| V nodes | O(V³) | O(V²) |

V ≤ about 400 is comfortable; beyond that run Dijkstra from every node instead (O(V·E log V)).

## When to use
- All-pairs distances on small graphs, or when many queries ask about arbitrary pairs.
- Transitive closure (`reach[i][j] = reach[i][j] or (reach[i][k] and reach[k][j])`).
- Negative edges are fine; a negative value on the diagonal afterwards means a negative cycle.
- Dense graphs given as a matrix.

## Pitfalls
- **k must be the outer loop.** Putting it inside computes something else.
- `inf + inf` overflows with integer sentinels; check for ∞ or use a sentinel like `10**18` carefully.
- Parallel edges: keep the minimum weight when filling the matrix.
- For undirected graphs fill both `dist[u][v]` and `dist[v][u]`.

## Template
```python
def floyd(n, edges):
    d = [[0 if i == j else float('inf') for j in range(n)] for i in range(n)]
    for u, v, w in edges:
        d[u][v] = min(d[u][v], w)
    for k in range(n):
        for i in range(n):
            for j in range(n):
                d[i][j] = min(d[i][j], d[i][k] + d[k][j])
    return d
```
