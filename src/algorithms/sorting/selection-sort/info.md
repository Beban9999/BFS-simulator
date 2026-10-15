## Explanation
Selection sort splits the array into a sorted prefix and an unsorted suffix. Each pass scans the whole unsorted suffix to find its **minimum**, then swaps it into the first unsorted slot. The prefix grows by one element per pass and never changes again.

It always does the same number of comparisons, whatever the input — even an already sorted array costs O(n²). Its one advantage is that it makes **at most n − 1 swaps**, which matters only when writes are far more expensive than reads.

**Invariant:** before pass `i`, `nums[0..i−1]` holds the `i` smallest values in sorted order, and every value in it is ≤ every value in `nums[i..]`.

## Complexity
| Case | Time | Space |
|---|---|---|
| Best / average / worst | O(n²) comparisons, ≤ n − 1 swaps | O(1) |

Stable: **no** — the long-distance swap can jump an element over an equal one (try the "Duplicates" preset).

## When to use
- Tiny arrays where minimising writes matters.
- As a mental model: "repeatedly pick the best remaining item" is the same idea as heap sort, which just finds the minimum faster.
- Partial selection: k passes give the k smallest elements in O(nk).

## Pitfalls
- No early exit: unlike bubble or insertion sort it does not speed up on sorted input.
- It is not stable; sorting records by one key can scramble the order of equal keys.
- Off-by-one: the outer loop only needs `n − 1` passes; the last element is automatically in place.

## Template
```python
for i in range(n - 1):
    min_i = min(range(i, n), key=nums.__getitem__)
    nums[i], nums[min_i] = nums[min_i], nums[i]
```
