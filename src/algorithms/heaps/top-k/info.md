## Explanation
To find the k largest values (or just the k-th largest) you don't need to sort everything. Keep the best k seen so far in a **min-heap**: its root is the *weakest* member of the current top k — the bar a new value has to clear.

For each value: while the heap has fewer than k items, push it. After that, compare it with the root: if it is bigger, it deserves a place, so replace the root with it (`heapreplace` = pop + push in a single sift-down); otherwise skip it. At the end the heap holds the k largest values and its root is the k-th largest.

The counter-intuitive part: "largest" uses a **min**-heap, because we need fast access to the one to kick out. For the k *smallest*, use a max-heap of size k.

**Invariant:** after processing a prefix of the input, the heap holds exactly the min(k, prefix length) largest values of that prefix.

## Complexity
| Approach | Time | Space |
|---|---|---|
| Size-k heap (this page) | O(n log k) | O(k) |
| Sort everything | O(n log n) | O(n) or O(1) |
| Quickselect | O(n) average, O(n²) worst | O(1) |
| Heapify all, pop k times | O(n + k log n) | O(n) |

## When to use
- Top-k / k-th largest or smallest, especially when k ≪ n or the data is a **stream** (you can't store or sort it all).
- "k most frequent", "k closest", "k best scores" — heap keyed by the score.
- When you need the top k in order at the end, pop the heap (or sort its k items).

## Pitfalls
- Using a max-heap for the k largest makes you hold all n items.
- Compare with `heap[0]` only after the heap is full.
- Ties: with `x > heap[0]`, equal values don't replace the root — fine for the k-th largest value, but matters if you return items with identities.

## Template
```python
import heapq
def top_k(nums, k):
    heap = nums[:k]
    heapq.heapify(heap)
    for x in nums[k:]:
        if x > heap[0]:
            heapq.heapreplace(heap, x)
    return sorted(heap, reverse=True)
```
