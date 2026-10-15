## Explanation
Depth-first search follows one edge, then one edge from there, and so on until it reaches a node with no unvisited neighbours. Only then does it **back up** to the most recent node that still has an unexplored edge. The nodes "in progress" form a path from the source, kept either by the **call stack** (recursive version) or an explicit **stack** (iterative version).

The edges that discover new nodes form the **DFS tree** (path colour). Edges to already-visited nodes are skipped; in later pages they are exactly what reveals cycles (back edges) and what Tarjan's algorithm uses for bridges and components.

The iterative version here pushes neighbours in **reverse** and marks a node visited when it is **popped**, so it produces the same order as the recursion. A node can sit on the stack more than once; the duplicate is skipped when popped.

**Invariant (recursive):** the call stack holds exactly the path from the source to the current node, and every node on it is visited but not finished.

## Complexity
| | Time | Space |
|---|---|---|
| Adjacency list | O(V + E) | O(V) visited + O(depth) stack |
| Iterative variant | O(V + E) | O(E) stack in the worst case (duplicates) |

Recursion depth can reach V on a long path; Python's default limit (about 1000) is easy to hit.

## When to use
- Reachability, connected components, flood fill.
- Anything that needs the "path so far": cycle detection, topological order (finish times), all paths, backtracking.
- Structure of a graph: bridges, articulation points, strongly connected components.
- BFS is better when you need the **fewest edges**; DFS paths are not shortest.

## Pitfalls
- Mark visited **on entry** to `visit(u)`, before recursing, or cycles recurse forever.
- Deep graphs overflow the call stack; switch to the iterative form (or raise the limit).
- The iterative version is only equivalent to the recursive one with the push-in-reverse + check-on-pop pattern; marking on push changes the order.
- On directed graphs, one DFS only reaches nodes along outgoing edges.

## Template
```python
def dfs(graph, source):
    visited = set()
    def visit(u):
        visited.add(u)
        for v in graph[u]:
            if v not in visited:
                visit(v)
    visit(source)
    return visited
```
