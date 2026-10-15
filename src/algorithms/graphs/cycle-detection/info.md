## Explanation
A DFS keeps the current path from its start node to the node it is exploring. A cycle exists exactly when some edge leads from the current node **back into that path** (a back edge).

**Undirected graphs.** Every edge appears twice (u–v and v–u), so the edge back to the node we just came from is not a cycle. Skip the **parent**, and any other neighbour that is already visited closes a cycle. (In an undirected DFS every non-tree edge is a back edge, so "visited" is enough.)

**Directed graphs.** "Visited" is not enough: an edge into a node that was **finished** in an earlier branch (a cross edge) does not form a cycle. Use three colours:
- **WHITE** — not discovered yet,
- **GRAY** — on the current DFS path (entered, not finished),
- **BLACK** — finished; every path out of it has been explored.

An edge `u → v` with `v` GRAY closes the cycle `v → … → u → v`. In the drawing, GRAY nodes are purple and BLACK nodes are dark blue.

**Invariant:** the GRAY nodes are exactly the nodes on the call stack, and they form a path.

## Complexity
| | Time | Space |
|---|---|---|
| Both versions | O(V + E) | O(V) colours + O(V) recursion |

## When to use
- Prerequisites, dependencies, deadlocks: "can everything be scheduled?" means "is the directed graph acyclic?".
- Checking that an undirected graph is a tree or forest.
- The three-colour DFS is the base of DFS topological sort and of "eventual safe states".
- Alternatives: Kahn's algorithm (directed: a cycle exists if some node never reaches in-degree 0) and Union-Find (undirected).

## Pitfalls
- Using the undirected "visited ⇒ cycle" rule on a directed graph reports false cycles (diamonds such as 0→1→3, 0→2→3).
- Forgetting to skip the parent in the undirected version makes every edge look like a cycle.
- Skipping the parent by **node** is wrong if parallel edges are allowed (two u–v edges are a real cycle); skip by edge id then.
- Run the DFS from **every** unvisited node: a cycle may sit in a component the first DFS never reaches.

## Template
```python
def has_cycle(n, graph):            # directed
    color = [0] * n                 # 0 white, 1 gray, 2 black
    def dfs(u):
        color[u] = 1
        for v in graph[u]:
            if color[v] == 1 or (color[v] == 0 and dfs(v)):
                return True
        color[u] = 2
        return False
    return any(color[u] == 0 and dfs(u) for u in range(n))
```
