## Explanation
Hoare's original partition scheme uses **two pointers moving toward each other**. `i` walks right until it finds a value that is **not smaller** than the pivot; `j` walks left until it finds a value that is **not larger**. Both values are on the wrong side, so swap them and continue. When the pointers cross, every value in `nums[lo..j]` is ≤ pivot and every value in `nums[j+1..hi]` is ≥ pivot.

Compared with Lomuto it does about three times fewer swaps on average, and values equal to the pivot stop *both* pointers, so they get spread over both sides — runs of duplicates no longer cause the O(n²) behaviour Lomuto has.

The catch: the pivot does **not** end up at a known final index. The returned `j` is just a split point, so the recursion is on `(lo, j)` and `(j + 1, hi)`, including `j`.

**Invariant:** at every swap, `nums[lo..i] ≤ pivot` and `nums[j..hi] ≥ pivot`; the unexamined part is strictly between `i` and `j`.

## Complexity
| Case | Time | Extra space |
|---|---|---|
| Best / average | O(n log n) | O(log n) recursion |
| Worst (adversarial pivots) | O(n²) | O(n) recursion |

Stable: **no**. Using the middle element as the pivot makes sorted and reversed inputs fast.

## When to use
- The default quick sort partition in many textbooks and libraries when duplicates are common.
- Any "split the array around a value with two converging pointers" problem.

## Pitfalls
- Recursing on `(lo, p − 1)` and `(p + 1, hi)` (the Lomuto split) is **wrong** here: the element at `p` is not necessarily final.
- With `pivot = nums[hi]` (instead of the middle or low element) Hoare can recurse forever on two equal-sized pieces — pick `nums[(lo + hi) // 2]` or `nums[lo]`.
- Both inner loops use strict `<` / `>`; using `<=` lets a pointer run off the end of the array.

## Template
```python
def partition(a, lo, hi):
    pivot = a[(lo + hi) // 2]
    i, j = lo - 1, hi + 1
    while True:
        i += 1
        while a[i] < pivot: i += 1
        j -= 1
        while a[j] > pivot: j -= 1
        if i >= j: return j
        a[i], a[j] = a[j], a[i]
```
