## Explanation
Trust the recursion: `reverse_list(head.next)` hands back the **reversed rest** of the list and its new head. The only node still pointing the wrong way is `head` itself. Its old neighbour `head.next` is now the **tail** of the reversed rest, so `head.next.next = head` hooks head onto the end, and `head.next = None` makes head the new tail.

The base case is a list of zero or one node, which is its own reverse. The new head (the old last node) is found at the deepest call and passed unchanged all the way back up.

**Invariant:** when a call returns, the nodes from its `head` to the end are reversed, `head` is their tail (pointing to `null`), and the returned value is the old last node.

## Complexity
| | Time | Space |
|---|---|---|
| Recursive | O(n) | O(n) — one stack frame per node |
| Iterative | O(n) | O(1) |

Deep lists can overflow the call stack (Python's default limit is about 1000 frames), so production code prefers the iterative loop.

## When to use
- To practise "solve the smaller problem, then fix up one node" thinking used all over trees and lists.
- Problems that naturally recurse on the rest of the list: swap pairs, reverse first n nodes, merge two sorted lists recursively.
- Interviews that ask for both the iterative and the recursive versions.

## Pitfalls
- Forgetting `head.next = None` leaves a 2-node cycle between the first two nodes.
- Returning `head` instead of `new_head` from the general case.
- The base case must cover `head is None` too, or an empty list crashes.
- O(n) stack space — mention it when asked about complexity.

## Template
```python
def reverse(head):
    if not head or not head.next:
        return head
    new_head = reverse(head.next)
    head.next.next = head
    head.next = None
    return new_head
```
