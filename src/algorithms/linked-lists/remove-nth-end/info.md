## Explanation
To delete a node from a singly linked list you need the node **before** it. The n-th node from the end is easy to find in two passes (count, then walk), but a fixed **gap** does it in one: move `fast` n + 1 nodes ahead of `slow`, then move both together. When `fast` falls off the end (becomes null), `slow` is exactly n + 1 nodes behind that null, i.e. right before the n-th node from the end. Then `slow.next = slow.next.next` skips it.

Both pointers start at a **dummy** node placed before the head. That way "remove the head" (n = length) needs no special case: slow simply stays on the dummy.

**Invariant:** while moving, fast is always exactly n + 1 nodes ahead of slow.

## Complexity
| | Time | Space |
|---|---|---|
| Gap pointers (one pass) | O(L) | O(1) |
| Count, then walk (two passes) | O(L) | O(1) |

L = length of the list.

## When to use
- "k-th from the end" of a list you can only walk forwards.
- Delete / insert relative to the end in one pass.
- Any time two positions must stay a fixed distance apart while scanning.

## Pitfalls
- The gap is n + 1 (not n) so that slow stops **before** the target.
- Without the dummy, removing the head needs separate code.
- Return `dummy.next`, not `head` — the head may have been the node removed.
- In languages without garbage collection, free the unlinked node.

## Template
```python
def remove_nth_from_end(head, n):
    dummy = slow = fast = ListNode(0, head)
    for _ in range(n + 1):
        fast = fast.next
    while fast:
        slow, fast = slow.next, fast.next
    slow.next = slow.next.next
    return dummy.next
```
