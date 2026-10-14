## Explanation
Edsger Dijkstra's Dutch National Flag problem: rearrange an array of three kinds of values (0, 1, 2 — red, white, blue) into three contiguous groups in **one pass** and O(1) space.

Three pointers split the array into four zones:

| Zone | Contents |
|---|---|
| `[0, low)` | all 0s |
| `[low, mid)` | all 1s |
| `[mid, high]` | not looked at yet |
| `(high, n)` | all 2s |

Look at `nums[mid]`: a 0 is swapped to the end of the 0 zone (both `low` and `mid` move), a 1 is already in place (`mid` moves), a 2 is swapped to the front of the 2 zone (only `high` moves, because the value swapped into `mid` hasn't been examined yet). The unknown zone shrinks by one every iteration.

**Invariant:** the four zones above hold at the start of every loop iteration.

## Complexity
| | Time | Space |
|---|---|---|
| All cases | O(n), single pass | O(1) |
| Counting sort alternative | O(n), two passes | O(1) |

## When to use
- Sorting an array with exactly three distinct keys, in place, in one pass.
- Three-way partitioning around a pivot (`< p`, `= p`, `> p`) — the core of 3-way quicksort / quickselect, which stays fast with many duplicates.
- The two-zone version (low/high only) solves "move all evens / negatives / zeros to one side".

## Pitfalls
- Advancing `mid` after swapping with `high` skips a value that was never examined.
- The loop condition is `mid <= high`, not `mid < high` — the element at `high` is still unknown.
- This partition is **not stable**: equal elements can change relative order.

## Template
```python
lo = mid = 0; hi = len(a) - 1
while mid <= hi:
    if a[mid] < pivot:  a[lo], a[mid] = a[mid], a[lo]; lo += 1; mid += 1
    elif a[mid] > pivot: a[mid], a[hi] = a[hi], a[mid]; hi -= 1
    else: mid += 1
```
