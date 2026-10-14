## Explanation
Many "modify the array in place" problems are compaction: keep some elements, drop others, and pack the survivors at the front. Two pointers moving in the **same direction** do it in one pass:

- `read` visits every element.
- `write` points at the slot where the next survivor goes; everything before it is the finished answer.

For a sorted array, a value is new exactly when it differs from the last value written (`nums[write − 1]`). Copy it to `nums[write]` and advance `write`. Duplicates are simply skipped by `read`. The array length is unchanged; the answer is the first `write` elements.

**Invariant:** `nums[0..write)` contains each distinct value seen so far exactly once, in order, and `write ≤ read`.

## Complexity
| | Time | Space |
|---|---|---|
| Read / write pointers | O(n) | O(1) |
| Build a new list | O(n) | O(n) |

## When to use
- "In place", "O(1) extra memory", "return the new length" — remove, filter, deduplicate, compress.
- The "allow at most k copies" variant: compare with `nums[write − k]`.
- String compression, partitioning by a predicate when order must be kept.

## Pitfalls
- Comparing `nums[read]` with `nums[read − 1]` works for sorted arrays too, but fails for the "at most k" variant — compare against the written prefix.
- Empty input: return 0 before setting `write = 1`.
- The tail after `write` still contains old values; the judge ignores it, but don't print it as part of the answer.

## Template
```python
write = 0
for read in range(len(nums)):
    if keep(nums[read]):
        nums[write] = nums[read]
        write += 1
return write
```
