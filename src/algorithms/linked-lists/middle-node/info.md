## Explanation
The obvious way is two passes: count the nodes, then walk n/2 steps. Fast & slow pointers do it in one pass: `fast` moves two nodes per step and `slow` one, so `slow` has always covered half the distance of `fast`. When `fast` cannot move any further, `slow` stands in the middle.

The loop condition decides which middle you get for even lengths. `while fast and fast.next` (shown here) stops with `slow` on the **second** middle; starting `fast = head.next` instead stops on the **first** middle — the version you want when splitting a list into two halves.

**Invariant:** after t steps, slow is t nodes from the head and fast is 2t nodes from the head.

## Complexity
| | Time | Space |
|---|---|---|
| Fast & slow | O(n) — about n/2 loop steps | O(1) |
| Count, then walk | O(n) — 1.5 n steps | O(1) |
| Copy into an array | O(n) | O(n) |

## When to use
- Split a list in half (merge sort on lists, palindrome check, reorder list).
- Anything defined relative to the middle: delete it, build a balanced BST from it.
- The same "different speeds" idea also finds cycles and the k-th node from the end (with a gap instead of a speed difference).

## Pitfalls
- `fast.next.next` crashes unless both `fast` and `fast.next` are checked.
- Know which middle the problem wants for even lengths, and pick the start of `fast` accordingly.
- When splitting, cut the link **before** the second half (`first_middle.next = None`), otherwise the halves stay joined.

## Template
```python
def middle(head):          # second middle for even lengths
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    return slow
```
