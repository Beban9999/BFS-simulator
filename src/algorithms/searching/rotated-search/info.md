## Explanation
A sorted array rotated at an unknown pivot (`[4,5,6,7,0,1,2]`) is no longer sorted, but it is made of two sorted runs. Pick any `mid`: at least **one** of the halves `[lo..mid]` and `[mid..hi]` is completely sorted (the pivot can only be in one of them).

- If `nums[lo] <= nums[mid]`, the left half is sorted. The target is in it exactly when `nums[lo] <= target < nums[mid]` — a simple range check that is only trustworthy on a sorted half. Otherwise go right.
- Else the right half is sorted; check `nums[mid] < target <= nums[hi]` the same way.

Each step still discards half the range, so the search stays O(log n).

**Invariant:** if the target is present, its index is in `[lo, hi]`.

## Complexity
| | Time | Space |
|---|---|---|
| Distinct values | O(log n) | O(1) |
| With duplicates (LC 81) | O(n) worst case | O(1) |

## When to use
- "Rotated sorted array", "shifted", "circularly sorted" + search in O(log n).
- More generally: binary search still works if every step can identify **one side where the target's presence can be decided**.

## Pitfalls
- Use `<=` in `nums[lo] <= nums[mid]`: when `lo == mid` the left "half" is a single sorted element.
- Range checks must be half-open on the `mid` side (`target < nums[mid]`) since `mid` was already compared.
- With duplicates, `nums[lo] == nums[mid] == nums[hi]` tells you nothing — shrink by one and continue.

## Template
```python
while lo <= hi:
    mid = (lo + hi) // 2
    if a[mid] == t: return mid
    if a[lo] <= a[mid]:
        if a[lo] <= t < a[mid]: hi = mid - 1
        else: lo = mid + 1
    else:
        if a[mid] < t <= a[hi]: lo = mid + 1
        else: hi = mid - 1
```
