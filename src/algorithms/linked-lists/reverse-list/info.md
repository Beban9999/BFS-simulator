## Explanation
A singly linked list only knows how to go forward, so to reverse it we flip every `next` arrow so it points backwards. The catch: the moment we overwrite `curr.next`, we lose the way to the rest of the list. So each round we first **save** `nxt = curr.next`, then **flip** `curr.next = prev`, then step both pointers one node forward.

`prev` starts at `null` because the old head becomes the new tail, whose `next` must be `null`. When `curr` falls off the end, `prev` sits on the old tail — the new head.

**Invariant:** at the top of each loop, `prev` is the head of the already-reversed part (`prev → … → null`) and `curr` is the head of the untouched rest; together they hold every node exactly once.

## Complexity
| | Time | Space |
|---|---|---|
| Iterative | O(n) — each node visited once | O(1) — three pointers |
| Recursive (for comparison) | O(n) | O(n) call stack |

## When to use
- "Reverse the list", or reverse a **part** of it (between positions, in groups of k).
- Comparing a list with its own reverse (palindrome check) without an O(n) copy.
- Adding numbers stored most-significant-digit first: reverse, add, reverse back.
- Any time you need to walk a singly linked list backwards with O(1) extra space.

## Pitfalls
- Forgetting to save `curr.next` before overwriting it — the rest of the list is lost.
- Returning `head` (now the tail) instead of `prev`.
- Moving `curr = curr.next` **after** the flip — that walks straight back to `prev`.
- An empty list must return `null`; the loop handles it if `prev` starts as `null`.

## Template
```python
def reverse(head):
    prev, curr = None, head
    while curr:
        curr.next, prev, curr = prev, curr, curr.next
    return prev
```
