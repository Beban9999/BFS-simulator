## Explanation
The median splits the combined sorted data into a left half and a right half where everything on the left is ≤ everything on the right. We can find that split **without merging**.

Cut `A` after `i` elements and `B` after `j = half − i` elements, so the two left pieces together hold `half = ⌈(m + n) / 2⌉` elements. Both arrays are sorted, so the cut is valid exactly when the cross conditions hold:

- `A[i−1] ≤ B[j]` and `B[j−1] ≤ A[i]` (missing neighbours count as ±∞).

If `A[i−1] > B[j]`, too many elements came from `A` → move the cut left. If `B[j−1] > A[i]`, too few came from `A` → move it right. That's a binary search over `i ∈ [0, m]`. Once valid, the median is `max(left tops)` (odd total) or the average of `max(left tops)` and `min(right bottoms)` (even total).

Searching the **shorter** array keeps `j` inside `B`'s bounds and makes the cost O(log min(m, n)).

**Invariant:** the correct cut index of `A` lies in `[lo, hi]`.

## Complexity
| | Time | Space |
|---|---|---|
| Partition binary search | O(log min(m, n)) | O(1) |
| Merge then pick middle | O(m + n) | O(m + n) (or O(1) with two pointers) |

## When to use
- Median / k-th smallest of two sorted arrays in logarithmic time.
- The general lesson: binary search can run over **how many elements to take** from one input when the other input's share is then determined.

## Pitfalls
- Searching the longer array lets `j` go negative or past the end.
- Forgetting the ±∞ sentinels when a cut is at an array's edge.
- Off-by-one in `half`: `(m + n + 1) // 2` puts the extra element on the left for odd totals, so the median is the max of the left side.

## Template
```python
if len(A) > len(B): A, B = B, A
lo, hi, half = 0, len(A), (len(A) + len(B) + 1) // 2
while lo <= hi:
    i = (lo + hi) // 2; j = half - i
    # compare A[i-1], A[i], B[j-1], B[j] with ±inf sentinels
```
