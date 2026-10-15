## Explanation
Each minute, every rotten orange rots its fresh neighbours. Running a separate BFS from each rotten orange would recount the same cells many times. Instead, **put every rotten orange in the queue at time 0**. This is **multi-source BFS**: it behaves exactly like one BFS from an imaginary super-source joined to all the starting cells.

Process the queue one **layer** at a time: the oranges in the queue at the start of a round rotted at the same minute, and the fresh neighbours they rot form the next minute's layer. The number of rounds is the answer. If fresh oranges remain when the queue empties, some fresh orange cannot be reached and the answer is `-1`.

The labels on the grid show the minute each orange went rotten (`0` for the starting ones). Each label is the distance from that orange to its **nearest** starting rotten orange.

**Invariant:** at the start of round `m`, the queue holds exactly the oranges that rotted at minute `m - 1`.

## Complexity
| | Time | Space |
|---|---|---|
| R×C grid | O(R·C) | O(R·C) queue in the worst case |

Every orange enters the queue once, however many sources there are.

## When to use
- "Minimum time for X to spread to everything" (rot, fire, infection, flooding).
- "Distance from each cell to the **nearest** source" (01 Matrix, Walls and Gates, Map of Highest Peak).
- Any BFS where several start points are equally valid: seed them all at distance 0.

## Pitfalls
- Counting minutes: don't add a minute after the last layer if nothing new rotted. Looping `while queue and fresh > 0` avoids that off-by-one.
- No fresh oranges at all → the answer is `0`, even with no rotten ones.
- Mark an orange rotten **when it is queued**, or two neighbours both enqueue it.
- Isolated fresh oranges (walled in by empty cells) make the answer `-1`.

## Template
```python
from collections import deque

def multi_source_bfs(grid, sources):
    dist = {s: 0 for s in sources}
    queue = deque(sources)
    while queue:
        r, c = queue.popleft()
        for nr, nc in neighbours(r, c):
            if (nr, nc) not in dist and open_cell(nr, nc):
                dist[(nr, nc)] = dist[(r, c)] + 1
                queue.append((nr, nc))
    return dist
```
