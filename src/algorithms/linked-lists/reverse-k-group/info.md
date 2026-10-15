## Explanation
Split the list into consecutive blocks of k nodes and reverse each block in place. A **dummy** node before the head means the first block is handled like every other one: `group_prev` is always the node just **before** the current block.

Each round: walk k steps from `group_prev` to find `kth`, the block's last node. If the list runs out first, the leftover tail is shorter than k and stays as it is. Otherwise remember `group_next = kth.next`, then run the usual prev/curr reversal — but start `prev` at `group_next` instead of null, so the block's new tail already links to the rest of the list. Finally hook `group_prev.next = kth` (the block's new first node) and move `group_prev` to the block's old first node, which is now its last.

**Invariant:** everything up to `group_prev` is finished (reversed in blocks and correctly linked); everything from `group_prev.next` on is still in the original order.

## Complexity
| | Time | Space |
|---|---|---|
| Iterative (this page) | O(n) — each node is counted once and flipped once | O(1) |
| Recursive version | O(n) | O(n / k) call stack |

## When to use
- Reverse fixed-size chunks of a list (k-groups, pairs).
- Any sub-list reversal where both ends must be re-attached: keep the node before and the node after the range.
- A dummy head whenever the head itself may change.

## Pitfalls
- Check that k nodes **exist** before reversing; the last short block must not be touched.
- Starting `prev` at `None` breaks the link to the next block — start it at `group_next`.
- After stitching, `group_prev` must move to the old **first** node of the block (now its last), not to `kth`.
- k = 1 should return the list unchanged.

## Template
```python
def reverse_k_group(head, k):
    dummy = group_prev = ListNode(0, head)
    while True:
        kth = group_prev
        for _ in range(k):
            kth = kth.next
            if not kth:
                return dummy.next
        group_next = kth.next
        prev, curr = group_next, group_prev.next
        while curr is not group_next:
            curr.next, prev, curr = prev, curr, curr.next
        first = group_prev.next
        group_prev.next, group_prev = kth, first
```
