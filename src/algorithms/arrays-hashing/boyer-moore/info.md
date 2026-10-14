## Explanation
Imagine every element voting. Pair up two **different** values and remove both: a value that occupies more than half the array cannot be wiped out, because it has more members than everyone else combined.

The algorithm does this pairing on the fly with one `candidate` and one `count`. A matching element adds a vote; a different element cancels one. When the count hits zero, the next element becomes the new candidate. If a majority exists, it is the candidate at the end.

If the input might have **no** majority, the surviving candidate is only a suspect — confirm it with a second counting pass.

**Invariant:** the elements processed so far can be split into cancelled pairs of different values plus `count` copies of `candidate`.

## Complexity
| | Time | Space |
|---|---|---|
| Vote + verify | O(n) | O(1) |
| Hash-map counting | O(n) | O(n) |
| Sort and take the middle | O(n log n) | O(1)–O(n) |

## When to use
- "Element appearing more than ⌊n/2⌋ times" with an O(1)-space requirement.
- Generalises to "more than n/k times" with k − 1 candidates and counters (k = 3 → Majority Element II).

## Pitfalls
- Without a guarantee, always verify — `[1, 2, 3]` ends with candidate 3, which is not a majority.
- Reset the candidate only when `count == 0`, *before* voting on the current element.
- For the n/3 version, check "equals candidate 1/2" before "count is zero", or both candidates can end up the same value.

## Template
```python
cand, cnt = None, 0
for x in nums:
    if cnt == 0:
        cand = x
    cnt += 1 if x == cand else -1
```
