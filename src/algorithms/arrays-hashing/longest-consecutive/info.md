## Explanation
Sorting finds runs of consecutive values in O(n log n). To get O(n), throw every value into a hash set, which answers "is `y` present?" in O(1).

The key idea is to only **start** counting at the beginning of a run: a value `x` is a run start exactly when `x − 1` is not in the set. From a start, walk `x + 1, x + 2, …` while they exist. Values in the middle of a run are skipped by the start check, so every value is visited by at most one walk — linear time overall even though there is a `while` inside a `for`.

**Invariant:** every walk begins at the smallest member of its run, so no run is counted twice.

## Complexity
| | Time | Space |
|---|---|---|
| Hash set with run starts | O(n) average | O(n) |
| Sort then scan | O(n log n) | O(1)–O(n) |
| Walk from every value (no start check) | O(n²) worst case | O(n) |

## When to use
- "Longest streak / sequence of consecutive values" in **unsorted** data with an O(n) requirement.
- More generally: when you can identify the unique "first element" of each group, process groups only from there to avoid repeated work.
- Union-Find also solves it (union x with x + 1), but is more code.

## Pitfalls
- Iterate over the **set**, not the original array: with many duplicates, iterating the array repeats work.
- Without the `x − 1 not in set` check the algorithm degrades to O(n²) on inputs like `[1, 2, …, n]`.
- Empty input should return 0.

## Template
```python
s = set(nums)
best = 0
for x in s:
    if x - 1 not in s:
        y = x
        while y + 1 in s:
            y += 1
        best = max(best, y - x + 1)
```
