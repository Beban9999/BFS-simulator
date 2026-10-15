## Explanation
A **minimum spanning tree** (MST) connects all nodes of a weighted undirected graph using V − 1 edges with the smallest possible total weight.

Kruskal's algorithm is greedy over **edges**. Sort them from lightest to heaviest and walk the list. An edge whose ends are in **different components** (different Union-Find roots) is taken, merging those components. An edge whose ends are already connected would close a cycle, so it is skipped (dashed). The algorithm stops once V − 1 edges are taken; if the graph is disconnected, it ends with a minimum spanning **forest**.

Why is greedy safe? By the **cut property**: for any split of the nodes into two groups, the lightest edge crossing the split belongs to some MST. When Kruskal takes an edge, it is the lightest edge crossing the cut between its component and the rest, since every lighter edge was already considered.

**Invariant:** the taken edges always form a forest that is contained in some minimum spanning tree.

## Complexity
| | Time | Space |
|---|---|---|
| Sort + Union-Find | O(E log E) | O(V) for Union-Find + O(E) for the sorted list |

Sorting dominates; the Union-Find work is nearly linear.

## When to use
- MST on a sparse graph or when edges come as a list.
- "Connect everything at minimum cost": cables, roads, clustering (stop at k components for k clusters).
- Variants: maximum spanning tree (sort descending), minimum bottleneck path, critical edges.
- Dense graphs (all pairs of points) → Prim with an O(V²) array can be faster.

## Pitfalls
- Kruskal is for **undirected** graphs; directed "arborescences" need a different algorithm.
- Check the final edge count: fewer than V − 1 edges means the graph was disconnected.
- Equal weights give several valid MSTs; the **total** is unique, the edge set may not be.
- Union-Find without path compression or union by rank can become slow on adversarial inputs.

## Template
```python
def kruskal(n, edges):                # edges: (u, v, w)
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    total = taken = 0
    for u, v, w in sorted(edges, key=lambda e: e[2]):
        ru, rv = find(u), find(v)
        if ru != rv:
            parent[ru] = rv
            total += w
            taken += 1
    return total if taken == n - 1 else -1
```
