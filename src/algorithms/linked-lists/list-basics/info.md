## Explanation
A linked list stores each value in its own **node** with a pointer to the next node (and, in a **doubly** linked list, also to the previous one). There is no index arithmetic: to reach position i you must walk i links from the head, so **search** and **access by index** are O(n).

The payoff is cheap re-wiring. To **insert** at position i, walk to the node *before* the slot, point the new node at the old occupant, then point the previous node at the new one — in that order, or the rest of the list is lost. To **delete** at position i, walk to the node before it and make it skip the target. Position 0 is special (there is no node before the head), which is why many solutions add a dummy head.

A doubly linked list must also keep every `prev` pointer consistent: two more assignments per insert or delete, in exchange for O(1) removal of a node you already hold and backwards traversal.

**Invariant:** following `next` from the head visits every node exactly once and ends at null; in a doubly linked list, `x.next.prev is x` for every node with a successor.

## Complexity
| Operation | Singly | Doubly | Array (for comparison) |
|---|---|---|---|
| Access / search | O(n) | O(n) | O(1) access, O(n) search |
| Insert/delete at head | O(1) | O(1) | O(n) |
| Insert/delete after a known node | O(1) | O(1) (also *before* it) | O(n) |
| Insert/delete at position i | O(i) walk + O(1) | O(i) + O(1) | O(n) |

Extra memory: one pointer per node (two for doubly).

## When to use
- Many inserts/deletes in the middle of a sequence when you already hold the neighbouring node (LRU caches, editors, schedulers).
- Queues and deques without resizing.
- Interview problems where the input *is* a list: practise dummy heads and "walk to the node before".

## Pitfalls
- Re-wiring in the wrong order (`prev.next = node` before `node.next = prev.next`) loses the rest of the list.
- Forgetting the head case (index 0) or the tail case (`node.next` is null).
- Doubly linked: updating `next` but not `prev` (or the other way round) leaves an inconsistent list.
- Walking `index` steps instead of `index - 1` lands *on* the slot instead of before it.

## Template
```python
def insert_after(prev, val):
    node = Node(val)
    node.next = prev.next
    prev.next = node

def delete_after(prev):
    prev.next = prev.next.next
```
