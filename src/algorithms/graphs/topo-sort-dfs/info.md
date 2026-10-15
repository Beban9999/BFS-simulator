## Explanation
Run a DFS from every unvisited node, and append a node to `finished` **after** all of its outgoing edges have been explored (postorder). For an edge `u → v` there are two cases. If `v` is new, DFS finishes `v` inside `u`'s call, before `u`. If `v` already finished earlier, it is in `finished` already. Either way `v` finishes before `u`. So reversing the finish list puts `u` before `v` for **every** edge, which is a topological order.

The one case that breaks this is an edge into a node that is still **on the path** (state 1, GRAY). That is a back edge and means a cycle, so no order exists. The numbers under the nodes are finish positions.

**Invariant:** when a node is appended to `finished`, every node reachable from it is already in `finished`.

## Complexity
| | Time | Space |
|---|---|---|
| Adjacency lists | O(V + E) | O(V) + recursion depth up to V |

## When to use
- Same problems as Kahn's algorithm; pick whichever you write faster.
- DFS order composes with memoised DFS on DAGs (longest path, counting paths).
- Finish order is also step 1 of Kosaraju's SCC algorithm.
- Prefer Kahn's when you need levels (parallel stages), a lexicographically smallest order, or no recursion.

## Pitfalls
- Appending on **entry** (preorder) instead of on exit gives a wrong order.
- Forgetting to reverse at the end (or prepend instead).
- With only "visited / not visited" you cannot tell a back edge from a cross edge, so cycles go unnoticed. Use three states.
- Deep chains hit Python's recursion limit.

## Template
```python
def topo(n, graph):
    state, out = [0] * n, []
    def dfs(u):
        state[u] = 1
        for v in graph[u]:
            if state[v] == 1 or (state[v] == 0 and not dfs(v)):
                return False
        state[u] = 2
        out.append(u)
        return True
    return out[::-1] if all(state[u] or dfs(u) for u in range(n)) else []
```
