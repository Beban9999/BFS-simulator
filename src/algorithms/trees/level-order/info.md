## Explanation
Breadth-first search visits the tree level by level: the root, then its children, then their children. A **queue** produces exactly that order — nodes leave in the order they were discovered, and children are always discovered after their parent's whole level.

To group the output by level, look at the queue's length at the start of each round: that many nodes form the current level. Pop exactly that many, append each one's children to the back (they belong to the next round), and close the level.

**Zigzag**: the same traversal, but every second level is reversed, so the reading direction alternates left→right, right→left.

**Invariant:** at the start of each round, the queue holds exactly the nodes of the next level, left to right.

## Complexity
| | Time | Space |
|---|---|---|
| BFS by levels | O(n) | O(w) — w = maximum width (up to ~n/2 for the last level of a full tree) |

## When to use
- Anything per level: level lists, averages, maximums, right/left side view, zigzag order.
- Shortest number of edges from the root (minimum depth, nearest leaf).
- Connecting nodes on the same level (populating next pointers).

## Pitfalls
- Reading `len(queue)` inside the loop instead of once per level mixes levels together.
- `list.pop(0)` is O(n) in Python — use `collections.deque`.
- Zigzag: reverse the *output* level, not the order children are enqueued, or the next level breaks.

## Template
```python
from collections import deque
def levels(root):
    q, res = deque([root] if root else []), []
    while q:
        res.append([])
        for _ in range(len(q)):
            n = q.popleft()
            res[-1].append(n.val)
            q.extend(c for c in (n.left, n.right) if c)
    return res
```
