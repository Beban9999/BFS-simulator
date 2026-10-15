## Explanation
With weights restricted to 0 and 1, Dijkstra's heap is overkill. The key property of the heap is that it pops nodes in non-decreasing distance order, and a **deque** can keep that order too:

- relaxing a **0-edge** gives `v` the same distance as `u`, so `v` goes to the **front** (it must be handled before anything farther away);
- relaxing a **1-edge** gives `v` distance `dist[u] + 1`, so it goes to the **back**, behind everything at distance `dist[u]`.

So the deque always holds at most two distance values, `d` and `d + 1`, in sorted order, just like plain BFS layers. A node may enter the deque twice (first via a 1-edge, later improved via a 0-edge); the later, larger entry is harmless because its relaxations fail.

The numbers under the nodes are the current distances; 0-weight edges are the ones labelled `0`.

**Invariant:** distances in the deque are non-decreasing from front to back and span at most two consecutive values.

## Complexity
| | Time | Space |
|---|---|---|
| 0/1 weights | O(V + E) | O(V) |

Dijkstra would cost O((V + E) log V) on the same graph.

## When to use
- Moves that are either free or cost one unit: removing obstacles, changing direction, switching lanes, flipping arrows.
- Grids where "walk on your colour" is free and "cross to another colour" costs 1.
- Generalisation: weights 0..k fit "Dial's algorithm" (k + 1 buckets).

## Pitfalls
- Use `appendleft` for 0-edges; pushing them to the back breaks the ordering and gives wrong answers.
- Don't mark nodes visited on push as in BFS: a node may still improve through a 0-edge.
- Any other weight (2, 5, …) breaks the two-layer argument; fall back to Dijkstra.
- `collections.deque`, not a list with `insert(0, x)` (that is O(n)).

## Template
```python
from collections import deque

def zero_one(graph, src):
    dist = {src: 0}
    dq = deque([src])
    while dq:
        u = dq.popleft()
        for v, w in graph[u]:
            nd = dist[u] + w
            if nd < dist.get(v, float('inf')):
                dist[v] = nd
                (dq.appendleft if w == 0 else dq.append)(v)
    return dist
```
