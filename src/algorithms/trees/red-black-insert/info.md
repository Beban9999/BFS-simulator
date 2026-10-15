## Explanation
A **red-black tree** colors every node red or black and keeps these rules:
1. The root is black.
2. A red node never has a red child.
3. Every path from a node down to a missing child passes through the same number of black nodes.

Together they guarantee height ≤ 2·log₂(n + 1). Insert the key as a **red** leaf (red never changes black counts), so only rule 2 can break: a red node under a red parent. Repair it bottom-up by looking at the **uncle** (the parent's sibling):

- **Case 1 — uncle is red:** recolor parent and uncle black, grandparent red. Black counts are unchanged; the problem may move up to the grandparent, so continue from there.
- **Case 2 — uncle is black and the node is an "inner" child (a triangle):** rotate at the parent to turn it into a straight line, then do case 3.
- **Case 3 — uncle is black and the node is an "outer" child (a line):** color the parent black, the grandparent red, and rotate at the grandparent. Done.

Finally paint the root black.

**Invariant:** during the fix-up, rules 1 and 3 hold everywhere, and rule 2 is broken in at most one place: between `node` and its parent.

## Complexity
| | Time |
|---|---|
| Search / insert / delete | O(log n) worst case |
| Rotations per insert | at most 2; recolorings O(log n) |

Compared with AVL: less strictly balanced (slightly slower lookups) but fewer rotations on updates — the reason C++ `std::map`, Java `TreeMap` and the Linux kernel use red-black trees.

## When to use
- Ordered maps / sets with frequent inserts and deletes and O(log n) worst-case guarantees.
- You rarely hand-write one in interviews — but knowing the cases explains the guarantees of library ordered maps.

## Pitfalls
- A missing child counts as **black** (the uncle may be None → black).
- Case 2 must re-point `node` to the old parent before the case-3 recoloring.
- Forgetting to recolor the root black at the end.

## Template
```python
from sortedcontainers import SortedList   # Python has no built-in TreeMap
s = SortedList([5, 1, 3]); s.add(4); s.bisect_left(3)
```
