## Explanation
Find every combination of candidates that adds up to `target`. The recursion carries `remain`, the amount still needed: choosing `c` recurses with `remain − c`, and `remain == 0` means the path is an answer.

**Sorting enables pruning.** Once a candidate is larger than `remain`, every candidate after it is larger too, so the loop **breaks** (the greyed node). Without sorting you could only `continue`.

**Mode I (reuse).** Each number may be used any number of times, so after choosing index `i` the recursion starts again at `i`, not `i + 1`. Starting at `i` (never earlier) still keeps the combination non-decreasing, so `[2, 3]` and `[3, 2]` are not both produced.

**Mode II (each element once).** Recurse from `i + 1`, and, as in Subsets II, skip a candidate equal to its left sibling (`i > start`). This removes duplicate combinations when the input repeats values.

**Invariant:** `sum(path) + remain == target`, and `path` is non-decreasing.

## Complexity
| | Time | Space |
|---|---|---|
| Mode I | exponential: O(n^(T/m)) in the worst case (T target, m smallest candidate) | O(T/m) recursion depth |
| Mode II | O(n · 2ⁿ) | O(n) |

Pruning by the sorted bound is what makes these fast in practice.

## When to use
- "All ways to pick numbers that sum to T" when the **combinations** themselves are needed.
- If only the **number** of ways (or a yes/no) is needed, use DP (coin change, subset sum).
- Mode I is the backtracking twin of the unbounded knapsack; mode II of 0/1 knapsack.

## Pitfalls
- Reuse: recurse with `i`, not `start` (that would re-allow smaller numbers and create permutations).
- `break` only works on **sorted** candidates; on unsorted input it loses answers.
- Candidates must be positive, or `remain` never shrinks and the search doesn't terminate.
- Mode II without the skip rule returns duplicates such as `[1, 7]` twice.

## Template
```python
def comb_sum(cands, target, reuse=True):
    cands.sort()
    res, path = [], []
    def bt(start, remain):
        if remain == 0:
            res.append(path[:]); return
        for i in range(start, len(cands)):
            if cands[i] > remain: break
            if not reuse and i > start and cands[i] == cands[i - 1]: continue
            path.append(cands[i])
            bt(i if reuse else i + 1, remain - cands[i])
            path.pop()
    bt(0, target)
    return res
```
