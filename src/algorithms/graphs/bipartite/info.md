## Explanation
A graph is **bipartite** when its nodes can be split into two sides so that every edge joins the two sides. Equivalently, the nodes can be coloured with two colours so that no edge has both ends the same colour.

Start BFS from any uncoloured node and give it colour 0 (blue). Each newly discovered neighbour gets the **opposite** colour of the node that found it, so colours alternate along every BFS path. Within a component the colouring is forced once the first node is chosen. If an edge ever connects two nodes of the **same** colour, the graph is not bipartite: that edge plus the two BFS paths back to their common ancestor form a cycle of odd length.

Run the BFS once per component, since each component can be coloured independently.

**Invariant:** every edge between two coloured nodes that has been checked so far joins different colours.

## Complexity
| | Time | Space |
|---|---|---|
| Adjacency lists | O(V + E) | O(V) colours + queue |

## When to use
- "Split into two groups so that no conflicting pair is in the same group".
- Checking for odd cycles (a graph is bipartite ⇔ it has no odd cycle).
- Matching problems require a bipartite graph first (jobs ↔ workers).
- DFS or Union-Find (union each node's neighbours together) work too.

## Pitfalls
- Disconnected graphs: loop over all nodes, not just node 0.
- The input `graph[u]` in LeetCode 785 is already an adjacency list; in 886 you must build it from pairs (both directions).
- Checking the conflict only for newly coloured nodes misses it; compare on **every** edge to a coloured node.
- Trees and even cycles are bipartite; a triangle is the smallest non-bipartite graph.

## Template
```python
def bipartite(n, graph):
    color = [-1] * n
    for s in range(n):
        if color[s] == -1:
            color[s], queue = 0, deque([s])
            while queue:
                u = queue.popleft()
                for v in graph[u]:
                    if color[v] == -1:
                        color[v] = color[u] ^ 1
                        queue.append(v)
                    elif color[v] == color[u]:
                        return False
    return True
```
