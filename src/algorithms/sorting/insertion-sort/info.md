## Explanation
Insertion sort works like sorting a hand of cards. The left part of the array is already sorted. Take the next element (the **key**), and shift every larger element in the sorted part one slot to the right until a gap opens where the key belongs; drop it there.

The amount of work is proportional to how far each element has to travel, i.e. the number of **inversions** (out-of-order pairs). A sorted array costs n − 1 comparisons; a nearly sorted array costs barely more. That is why production sorts such as Timsort and introsort switch to insertion sort for small or nearly sorted pieces.

In the animation the key slides left through the gap it opens, so you can follow it; the code expresses the same thing with shifts.

**Invariant:** before processing index `i`, `nums[0..i−1]` is sorted (but not final — later keys can still be inserted into it).

## Complexity
| Case | Time | Space |
|---|---|---|
| Best (already sorted) | O(n) | O(1) |
| Average / worst (reversed) | O(n²) — precisely O(n + inversions) | O(1) |

Stable: yes, because a key never moves past an equal value (`>` not `>=`).

## When to use
- Small arrays (tens of elements) or data that is already nearly sorted.
- Online sorting: elements arrive one by one and must stay sorted.
- As the base case inside merge sort / quick sort implementations.

## Pitfalls
- Using `>=` in the while condition breaks stability.
- Shifting with swaps is correct but does about 3× more writes than shifting and placing once.
- Binary search can find the insertion point in O(log n), but the shifting is still O(n) per element.

## Template
```python
for i in range(1, n):
    key, j = a[i], i - 1
    while j >= 0 and a[j] > key:
        a[j + 1] = a[j]; j -= 1
    a[j + 1] = key
```
