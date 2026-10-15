## Explanation
A **binary heap** is a complete binary tree — every level full except possibly the last, which fills from the left — where every parent is ≤ its children (a **min-heap**; a max-heap flips the comparison). So the minimum is always at the root.

Because the tree is complete, it fits in a plain array with no pointers: the children of index `i` are `2i+1` and `2i+2`, and its parent is `(i−1)//2`.

- **push**: append the value as the new last leaf, then **sift up** — swap it with its parent while it is smaller. At most one swap per level: O(log n).
- **pop**: the minimum is `h[0]`. Swap it with the last element, remove it, then **sift down** the new root — swap it with its smaller child while that child is smaller. O(log n).
- **build-heap**: run sift-down on every non-leaf from the last one (`n//2 − 1`) back to the root. Most nodes are near the bottom and sink only a little, so the total is **O(n)**, not O(n log n).

**Invariant:** for every index i > 0, `h[(i−1)//2] ≤ h[i]` (outside the one element currently being sifted).

## Complexity
| Operation | Time |
|---|---|
| peek (min) | O(1) |
| push / pop | O(log n) |
| build-heap from n values | O(n) |
| search for an arbitrary value | O(n) |

Space: the array itself, O(n).

## When to use
- You repeatedly need the smallest (or largest) of a changing set: priority queues, schedulers, event simulation.
- Top-k, k-way merge, running medians, Dijkstra / Prim, Huffman coding.
- Python: `heapq` (min-heap; negate values for a max-heap). Java: `PriorityQueue`. C++: `priority_queue` (max-heap by default).

## Pitfalls
- A heap is **not sorted**: only the root is guaranteed; siblings are in no order.
- Off-by-one in the index formulas (they differ for 1-based heaps: children 2i and 2i+1).
- Building a heap by n pushes costs O(n log n); `heapify` / build-heap is O(n).
- Decrease-key needs the element's index; most libraries don't offer it (push a new entry and skip stale ones instead).

## Template
```python
import heapq
h = [5, 3, 8, 1]
heapq.heapify(h)          # O(n)
heapq.heappush(h, 2)      # O(log n)
smallest = heapq.heappop(h)
top = h[0]                # peek
```
