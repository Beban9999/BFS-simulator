## Explanation
The brute force for Two Sum checks every pair: O(n²). A hash map removes the inner loop. While scanning, remember every value you have already passed (`value → index`). For the current number `x`, the partner you need is `target − x`; a hash lookup tells you in O(1) whether that partner appeared earlier.

Checking **before** inserting `x` is what stops an element from pairing with itself (e.g. `target = 6`, `x = 3` only matches a *different* 3).

**Invariant:** when index `i` is examined, `seen` holds exactly the values at indexes `0..i-1`, so any pair `(j, i)` with `j < i` is found the moment `i` is reached.

## Complexity
| | Time | Space |
|---|---|---|
| Hash map, one pass | O(n) average | O(n) |
| Sort + two pointers | O(n log n) | O(1)–O(n) (loses original indexes) |
| Brute force | O(n²) | O(1) |

## When to use
- "Find two elements with a given sum / difference", "has this been seen before?", "first duplicate".
- Any time an inner loop only searches for one specific value: replace it with a set or map lookup.
- Use **two pointers** instead when the array is already sorted and O(1) space matters (see Two Sum II).

## Pitfalls
- Inserting before checking lets `x` pair with itself.
- With duplicates, storing `seen[x] = i` overwrites earlier indexes — fine for Two Sum, wrong when you need the *first* occurrence.
- Hash lookups are O(1) on average, not worst case; interviewers occasionally ask about this.

## Template
```python
seen = {}
for i, x in enumerate(nums):
    if target - x in seen:
        return [seen[target - x], i]
    seen[x] = i
```
