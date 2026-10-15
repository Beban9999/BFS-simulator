## Explanation
The median splits the sorted values into a smaller half and a larger half. We never need the halves sorted — only their **boundary**: the largest of the small half and the smallest of the large half. Two heaps give exactly that:

- `low` — a **max-heap** with the smaller half (its root is the biggest small value);
- `high` — a **min-heap** with the larger half (its root is the smallest big value).

To add `x` while keeping every value in `low` ≤ every value in `high`: push `x` into `low`, then move `low`'s maximum over to `high`. That max is guaranteed to belong to the larger half. Finally, if `high` became bigger than `low`, move `high`'s minimum back. So `low` always has the same size as `high`, or one more.

The median is then `low`'s root (odd count) or the average of both roots (even count).

**Invariant:** `max(low) ≤ min(high)` and `len(low) − len(high) ∈ {0, 1}`.

## Complexity
| Operation | Time |
|---|---|
| addNum | O(log n) — at most three heap operations |
| findMedian | O(1) |

Space: O(n) for all values.

## When to use
- Running median / percentile of a stream.
- Any "split into two groups by rank, and keep the boundary" problem: the k best vs. the rest, affordable vs. unaffordable projects.
- Sliding-window medians (add lazy deletion for values that leave).

## Pitfalls
- Python's `heapq` is min-only: store negated values in the max-heap and negate them back when reading.
- Pushing directly into whichever heap "looks right" without the move-and-rebalance dance easily breaks `max(low) ≤ min(high)`.
- Integer division when averaging the two middles in typed languages; overflow when adding two large ints.

## Template
```python
import heapq
low, high = [], []            # low stores negatives
def add(x):
    heapq.heappush(low, -x)
    heapq.heappush(high, -heapq.heappop(low))
    if len(high) > len(low):
        heapq.heappush(low, -heapq.heappop(high))
def median():
    return -low[0] if len(low) > len(high) else (-low[0] + high[0]) / 2
```
