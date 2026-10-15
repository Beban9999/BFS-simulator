## Explanation
With k sorted lists, the next node of the answer is always the smallest of the k **front** nodes. Comparing all fronts every time costs O(k) per node; a **min-heap** of the fronts gives the smallest in O(log k).

Seed the heap with the head of every non-empty list. Then repeat: pop the smallest node, hang it on `tail.next`, and if that node has a successor, push the successor — it is the new front of the same list. The heap never holds more than k nodes. A dummy head avoids special-casing the first node.

**Invariant:** the heap holds exactly one node — the current front — for every list that still has nodes, and the merged list holds the popped nodes in sorted order.

## Complexity
| Approach | Time | Space |
|---|---|---|
| Heap of fronts (this page) | O(N log k) | O(k) heap |
| Pairwise divide and conquer | O(N log k) | O(1) iterative / O(log k) recursive |
| Merge one list at a time | O(N · k) | O(1) |

N = total number of nodes, k = number of lists.

## When to use
- Merge many sorted sequences (log files, sorted runs in external sorting).
- "k-th smallest across sorted rows / lists / pairs" — pop k times from a heap of fronts.
- Whenever you repeatedly need the minimum of a small, changing set of candidates.

## Pitfalls
- Python's `heapq` compares tuples element by element; with equal values it would compare the nodes and crash — add the list index as a tie-breaker.
- Do not push all N nodes up front: the heap then costs O(N) space and O(N log N) time.
- Skip empty lists when seeding.
- Merging the lists one after another into a growing result is O(N · k), not O(N log k).

## Template
```python
import heapq

def merge_k(lists):
    heap = [(n.val, i, n) for i, n in enumerate(lists) if n]
    heapq.heapify(heap)
    dummy = tail = ListNode()
    while heap:
        _, i, n = heapq.heappop(heap)
        tail.next = tail = n
        if n.next:
            heapq.heappush(heap, (n.next.val, i, n.next))
    return dummy.next
```
