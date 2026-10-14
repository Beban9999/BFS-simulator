## Explanation
Breadth-first search explores a graph in **layers**. It starts from one cell, visits every cell one step away, then every cell two steps away, and so on. A FIFO **queue** enforces this: cells are processed in exactly the order they were discovered.

Because every cell is reached for the first time along a shortest route, the moment BFS pops the target you can walk the `prev` links back to the start and get a **shortest path** (in an unweighted grid or graph).

**Invariant:** the queue only ever holds cells from at most two consecutive distance layers, `d` and `d + 1`, with all of layer `d` in front.

## Complexity
| | Time | Space |
|---|---|---|
| Grid with R×C cells | O(R·C) | O(R·C) for `prev` + queue |
| Graph with V vertices, E edges | O(V + E) | O(V) |

Each cell is enqueued at most once and each edge is looked at a constant number of times.

## When to use
- "Shortest path / minimum number of steps / moves" in an **unweighted** grid or graph.
- "Nearest" anything (exit, gate, zero): BFS from the source(s) stops at the first hit.
- Spreading processes over time (rotting, infection, fire): use **multi-source BFS** with all sources in the queue at time 0.
- Level-by-level questions on trees (level order, right side view).

## Pitfalls
- Mark a cell as seen **when you enqueue it**, not when you dequeue it, or the same cell gets enqueued many times.
- Using `list.pop(0)` in Python is O(n); use `collections.deque`.
- BFS only gives shortest paths when every edge has the same cost. With weights use Dijkstra (or 0-1 BFS for 0/1 weights).
- Forgetting bounds checks or wall checks before reading `grid[nr][nc]`.

## Template
```python
from collections import deque

def bfs(start):
    queue, seen = deque([start]), {start}
    steps = 0
    while queue:
        for _ in range(len(queue)):        # one whole layer
            node = queue.popleft()
            if is_target(node):
                return steps
            for nxt in neighbors(node):
                if nxt not in seen:
                    seen.add(nxt)
                    queue.append(nxt)
        steps += 1
    return -1
```
