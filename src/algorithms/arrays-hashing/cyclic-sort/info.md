## Explanation
When an array of length `n` holds values from a known range like `1..n`, every value has a natural **home**: value `v` belongs at index `v − 1`. Cyclic sort walks the array and keeps swapping the current value into its home until the value at `i` is either correct or a duplicate of what is already at home. Then it moves on.

Each swap puts at least one value permanently in place, so there are at most `n − 1` swaps and the whole thing is O(n) even though there is a nested-looking loop.

Afterwards, any index `i` that does not hold `i + 1` is a "hole": `i + 1` is missing, and the value sitting there is a duplicate. The array itself acts as the hash table.

**Invariant:** once `i` advances past an index, that index will never need to change again.

## Complexity
| | Time | Space |
|---|---|---|
| Place + scan | O(n) (≤ n − 1 swaps) | O(1) |
| Hash set | O(n) | O(n) |
| Sort | O(n log n) | O(1) |

## When to use
- The statement says values are in `1..n` (or `0..n`) and asks for missing numbers, duplicates, or the first missing positive — with O(1) extra space.
- Related trick: mark presence by **negating** `nums[abs(x) − 1]` instead of swapping.

## Pitfalls
- Comparing `nums[i] != i + 1` instead of `nums[i] != nums[home]` loops forever on duplicates.
- For First Missing Positive, skip values `≤ 0` or `> n` before computing `home`, or you index out of bounds.
- The input is modified; copy it first if the caller needs the original.

## Template
```python
i = 0
while i < n:
    j = nums[i] - 1
    if 0 <= j < n and nums[i] != nums[j]:
        nums[i], nums[j] = nums[j], nums[i]
    else:
        i += 1
```
