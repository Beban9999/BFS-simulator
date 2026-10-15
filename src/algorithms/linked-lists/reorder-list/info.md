## Explanation
The target order takes nodes alternately from the **front** and the **back**. A singly linked list cannot walk backwards, so we turn the back half around first. Three standard moves, each O(n):

1. **Middle** — slow/fast pointers, with fast starting one node ahead so slow stops on the *first* middle. Cut the list after slow.
2. **Reverse** the second half, so its first node is the old tail.
3. **Weave** — take one node from the first half, then one from the reversed second half, and so on. Each round saves both `next` pointers before re-linking.

The first half is never shorter than the second, so the weave loop runs while the second half has nodes, and the last first-half node keeps the `None` set by the cut.

**Invariant:** during the weave, the nodes before `first` are already in their final order, and `first` and `second` are the heads of what is left of each half.

## Complexity
| | Time | Space |
|---|---|---|
| Middle + reverse + weave | O(n) | O(1) |
| Copy nodes to an array, two pointers | O(n) | O(n) |

## When to use
- Rearrangements that pair the i-th node from the front with the i-th from the back.
- Folding / zig-zag orderings of a list in place.
- Practice for combining small list routines into one solution.

## Pitfalls
- Forgetting to cut after the middle creates a cycle during the weave.
- Saving only one of the two `next` pointers before re-linking loses a half.
- Using the *second* middle for odd lengths puts the middle node in the wrong half; start fast at `head.next`.
- The list is modified in place; the function returns nothing on LeetCode.

## Template
```python
def reorder_list(head):
    slow, fast = head, head.next
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    second, slow.next, prev = slow.next, None, None
    while second:
        second.next, prev, second = prev, second, second.next
    first, second = head, prev
    while second:
        n1, n2 = first.next, second.next
        first.next, second.next = second, n1
        first, second = n1, n2
```
