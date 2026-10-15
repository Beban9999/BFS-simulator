## Explanation
A list is a palindrome when it reads the same from both ends — but a singly linked list can only be walked forwards. Copying the values into an array works in O(n) space; the O(1)-space trick has three phases:

1. **Find the middle** with slow/fast pointers: fast moves two nodes per step, slow one, so when fast runs out slow is at the middle (the second middle for even lengths).
2. **Reverse the second half** starting at slow, so it can be walked from the old tail back towards the middle.
3. **Compare**: walk `left` from the head and `right` from the old tail together. Any mismatch means "not a palindrome"; if `right` runs out first, every mirrored pair matched.

**Invariant:** during phase 3, the pairs already passed are equal values at mirrored positions (i from the front, i from the back).

## Complexity
| | Time | Space |
|---|---|---|
| Middle + reverse + compare | O(n) | O(1) |
| Copy to array + two pointers | O(n) | O(n) |

## When to use
- Symmetry questions on a singly linked list with an O(1)-space requirement.
- "Pair node i with node n−1−i" (twin sums, folding, reorder list).
- Any time you need the middle of a list without knowing its length.

## Pitfalls
- The input list is modified. Reverse the second half back before returning if the caller still needs it.
- Loop on `right` (the shorter half), not on `left`: for odd lengths the middle node belongs to both halves and is compared with itself.
- `while fast and fast.next` — checking only `fast.next` crashes on an empty list.

## Template
```python
def is_palindrome(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    prev = None
    while slow:
        slow.next, prev, slow = prev, slow, slow.next
    while prev:
        if head.val != prev.val:
            return False
        head, prev = head.next, prev.next
    return True
```
