## Explanation
Bubble sort walks the array comparing neighbours and swaps any pair that is out of order. After one full pass the largest value has "bubbled" to the last position; after the second pass the second-largest is in place, and so on. Each pass can therefore stop one position earlier.

If a pass makes **no swaps**, the array is already sorted and the algorithm can stop — giving O(n) on sorted input.

It is mainly a teaching tool: simple and stable, but it performs far more swaps than insertion sort on the same input.

**Invariant:** after the pass with boundary `end`, `nums[end..n−1]` holds the largest values in their final order.

## Complexity
| Case | Time | Space |
|---|---|---|
| Best (sorted, with early exit) | O(n) | O(1) |
| Average / worst | O(n²) comparisons and swaps | O(1) |

Stable: yes (only strictly greater neighbours are swapped).

## When to use
- Almost never in production; useful to explain sorting invariants, stability and adjacent-swap counts.
- The number of swaps bubble sort makes equals the number of **inversions** — a common interview fact.

## Pitfalls
- Swapping on `>=` instead of `>` breaks stability.
- Forgetting to shrink the inner loop wastes comparisons on the sorted tail.
- Without the early-exit flag the best case is still O(n²).

## Template
```python
for end in range(n - 1, 0, -1):
    swapped = False
    for i in range(end):
        if a[i] > a[i + 1]:
            a[i], a[i + 1] = a[i + 1], a[i]; swapped = True
    if not swapped: break
```
