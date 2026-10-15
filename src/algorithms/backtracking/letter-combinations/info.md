## Explanation
Each digit maps to 3 or 4 letters, and an answer picks **one letter per digit**, in order. The recursion has one level per digit: `backtrack(i)` loops over the letters of `digits[i]`, appends one, recurses to `i + 1`, and pops it. At `i == len(digits)`, the path is a full word.

There is no pruning: every branch is valid, so the tree is the full **cartesian product** of the keys. For `"23"` that is 3 × 3 = 9 leaves. This is the simplest backtracking tree, and a good one to learn the choose / explore / un-choose rhythm on before adding constraints.

Edge case: an empty input returns `[]`, **not** `[""]`.

**Invariant:** `path` holds exactly one letter for each of the first `i` digits.

## Complexity
| | Time | Space |
|---|---|---|
| n digits | O(n · 4ⁿ) (up to 4 letters per key, each word costs n to build) | O(n) recursion |

## When to use
- "All combinations taking one option from each group" (menus, outfits, product of choices).
- Iterative alternative: start with `[""]` and, for each digit, extend every partial word by each letter.
- `itertools.product(*groups)` in Python does the same in one line.

## Pitfalls
- Returning `[""]` for empty input.
- Joining `path` on each record costs O(n); building a string parameter instead (`backtrack(i, prefix + ch)`) avoids the pop.
- 7 and 9 have four letters.

## Template
```python
def product(groups):
    res, path = [], []
    def bt(i):
        if i == len(groups):
            res.append(''.join(path)); return
        for option in groups[i]:
            path.append(option); bt(i + 1); path.pop()
    bt(0)
    return res if groups else []
```
