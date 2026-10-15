## Explanation
A **topological order** lists the nodes of a directed graph so that every edge `u → v` goes from an earlier node to a later one, like taking courses only after their prerequisites. It exists exactly when the graph has no directed cycle (a DAG).

Kahn's algorithm builds the order front to back. A node with **in-degree 0** has no prerequisites left, so it can go next. Output it and "remove" its outgoing edges by decrementing its successors' in-degrees. Any successor that drops to 0 is now ready and joins the queue. The small number under each node is its current in-degree.

If the queue empties before every node is output, the remaining nodes all still have an incoming edge from another remaining node. Then they contain a cycle and no topological order exists.

**Invariant:** every node already in `order` had all of its predecessors output before it; the queue holds exactly the unprocessed nodes whose in-degree is 0.

## Complexity
| | Time | Space |
|---|---|---|
| Adjacency lists | O(V + E) | O(V) in-degrees + queue |

## When to use
- Schedules and build systems: tasks with prerequisites, compile order, spreadsheet recalculation.
- "Can all courses be finished?" (cycle check for free) and "in what order?".
- Level-by-level variant: process the queue one round at a time to get the minimum number of semesters / parallel stages.
- A min-heap instead of a FIFO queue gives the lexicographically smallest order.

## Pitfalls
- The edge direction matters: `[a, b]` in Course Schedule means "b before a" (edge b → a).
- Topological orders are usually not unique; tests may accept any valid one, but this page's order follows the queue.
- Duplicate edges inflate in-degrees; deduplicate if the input can contain them.
- Remember the final length check — without it a cyclic graph silently returns a partial order.

## Template
```python
from collections import deque

def kahn(n, edges):
    graph, indeg = [[] for _ in range(n)], [0] * n
    for u, v in edges:
        graph[u].append(v)
        indeg[v] += 1
    queue = deque(i for i in range(n) if indeg[i] == 0)
    order = []
    while queue:
        u = queue.popleft()
        order.append(u)
        for v in graph[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                queue.append(v)
    return order if len(order) == n else []
```
