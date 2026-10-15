## Explanation
Both lists are already sorted, so the smallest remaining value is always at the **front** of one of them. Keep a `tail` pointer to the last node of the merged list. Each round, compare the two fronts, hang the smaller node on `tail.next`, advance that list, and move `tail` forward. When one list is empty, the other one is already sorted and is attached in one go.

A **dummy** node in front of the result removes the "is the merged list still empty?" special case: `tail` always has a node to attach to, and the answer is `dummy.next`. No values are copied and no nodes are created — only `next` pointers change.

**Invariant:** `dummy → … → tail` holds the smallest nodes seen so far in sorted order, and every node in it is ≤ both current fronts.

## Complexity
| | Time | Space |
|---|---|---|
| Iterative splice | O(n + m) | O(1) |
| Recursive version | O(n + m) | O(n + m) call stack |

Stable: yes — on ties (`<=`) the node from `list1` goes first.

## When to use
- Combine two sorted sequences (the merge step of merge sort, sorted list union).
- Any time the head of the result is not known in advance — reach for a dummy node.
- Building block for k-way merging (pairwise or with a heap).

## Pitfalls
- Forgetting to attach the leftover list at the end.
- Returning `dummy` instead of `dummy.next`.
- Advancing `tail` before setting `tail.next` loses the node.
- Using `<` instead of `<=` makes the merge unstable (matters when nodes carry more than a value).

## Template
```python
def merge(a, b):
    dummy = tail = ListNode()
    while a and b:
        if a.val <= b.val:
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a or b
    return dummy.next
```
