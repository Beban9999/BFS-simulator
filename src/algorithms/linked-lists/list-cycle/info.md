## Explanation
Two pointers walk the list: `slow` moves one node per step, `fast` moves two. Without a cycle, `fast` reaches the end and we are done. With a cycle, both pointers eventually circle inside it, and since `fast` gains exactly one node per step on `slow`, it cannot jump over it — they **meet**.

To find **where** the cycle starts, put `slow` back at the head and move both pointers one step at a time; they meet again exactly at the entry node. Why: let `a` be the distance from the head to the entry, and the meeting point be `b` nodes into a cycle of length `c`. Fast travelled twice as far as slow, which gives `a + b ≡ 0 (mod c)`, i.e. walking `a` more steps from the meeting point lands on the entry — the same `a` steps that take the head to the entry.

**Invariant:** in phase 1, after t steps slow is t nodes from the head and fast 2t; in phase 2, both pointers are the same number of steps away from the entry.

## Complexity
| | Time | Space |
|---|---|---|
| Floyd (both phases) | O(n) | O(1) |
| Hash set of visited nodes | O(n) | O(n) |

## When to use
- Detect a loop in a linked structure without extra memory.
- Find the start of the loop (cycle entry), or its length (keep one pointer still and count).
- Implicit lists: any function `x → f(x)` on a finite set (duplicate number, happy number, PRNG periods).

## Pitfalls
- Check `fast and fast.next` before jumping two steps.
- Compare **nodes** (`is` / `===`), not values — different nodes can hold equal values.
- Move the pointers **before** comparing them; both start at the head, so comparing first would "meet" immediately.
- Phase 2 moves both pointers one step, not two.

## Template
```python
def cycle_start(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow is fast:
            slow = head
            while slow is not fast:
                slow, fast = slow.next, fast.next
            return slow
    return None
```
