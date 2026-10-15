## Explanation
Rain on a cell flows to a neighbour whose height is **lower or equal**. The Pacific touches the top and left edges, the Atlantic the bottom and right edges. We want every cell from which water can reach **both** oceans.

Searching downhill from every cell would repeat the same work R·C times. Reverse the question: water from cell X reaches the ocean exactly when you can walk **from the ocean to X going uphill** (each step to a neighbour that is at least as high). So run one multi-source BFS from all Pacific coast cells, climbing only to equal-or-higher neighbours, and one from all Atlantic coast cells. A cell reached by both climbs is an answer.

Purple cells drain to the Pacific, teal to the Atlantic, and yellow to both.

**Invariant:** every cell in a climb's `seen` set has a non-increasing path down to that climb's ocean.

## Complexity
| | Time | Space |
|---|---|---|
| R×C heights | O(R·C) | O(R·C) for the two `seen` sets |

Two searches, each visiting every cell at most once — instead of one search per cell (O((R·C)²)).

## When to use
- "Which cells can reach the border / a target set?" → start from the **targets** and search backwards.
- Several target groups → one search per group, then intersect or union the results.
- Reverse the edge condition too: "flows down" becomes "climbs up".

## Pitfalls
- The comparison is `>=` when climbing (equal heights let water flow both ways).
- Corner cells belong to both coasts of their ocean; don't add them twice (or use a set).
- The top-right and bottom-left corners touch **both** oceans, so they are always answers.
- Recursion depth on a large flat grid; BFS avoids it.

## Template
```python
def reach_from(starts, can_step):
    seen, queue = set(starts), deque(starts)
    while queue:
        cell = queue.popleft()
        for nxt in neighbours(cell):
            if nxt not in seen and can_step(cell, nxt):
                seen.add(nxt)
                queue.append(nxt)
    return seen
# answer = reach_from(group_a, uphill) & reach_from(group_b, uphill)
```
