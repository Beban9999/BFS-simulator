## Explanation
When every row is sorted **and** the first value of each row is larger than the last value of the previous row, reading the matrix row by row gives one fully sorted list of `R · C` numbers. You don't need to build that list: map a virtual index `k` to a cell with `row = k // C`, `col = k % C`, and run an ordinary binary search over `0..R·C − 1`.

**Invariant:** if the target exists, its virtual index lies in `[lo, hi]`.

## Complexity
| | Time | Space |
|---|---|---|
| Flattened binary search | O(log(R · C)) | O(1) |
| Binary search row, then column | O(log R + log C) — same | O(1) |
| Staircase walk | O(R + C) | O(1) |

## When to use
- A matrix that is sorted in **row-major order** (LeetCode 74).
- Generally: any structure you can index as a sorted sequence through an O(1) mapping (circular buffers, concatenated sorted blocks).
- If only rows and columns are sorted individually (LeetCode 240), the flattening trick is invalid — use the staircase walk.

## Pitfalls
- Dividing by the number of **rows** instead of columns when mapping the index.
- Applying this to a matrix whose rows overlap in value range.
- Empty matrix / empty rows.

## Template
```python
lo, hi = 0, R * C - 1
while lo <= hi:
    mid = (lo + hi) // 2
    v = m[mid // C][mid % C]
    if v == t: return True
    if v < t: lo = mid + 1
    else: hi = mid - 1
return False
```
