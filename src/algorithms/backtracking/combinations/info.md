## Explanation
Combinations are subsets of a fixed size `k`. Use the same start-index recursion as subsets: numbers are added in increasing order, so `[1, 3]` is built but `[3, 1]` never is. The only difference is **when** a node is recorded: only once `path` holds exactly `k` numbers.

**Pruning.** With `need = k − len(path)` numbers still to pick, starting at `x` leaves only `n − x + 1` numbers (x, …, n). If that is fewer than `need`, the branch can never reach size `k`. The same holds for every larger `x`, so the loop can `break`. These cut branches are drawn greyed out. Without the cut, the tree contains many dead branches that never record anything.

**Invariant:** `path` is strictly increasing and every node on the tree can still be completed to size `k`.

## Complexity
| | Time | Space |
|---|---|---|
| C(n, k) results | O(k · C(n, k)) | O(k) recursion + path |

## When to use
- "All groups / teams / selections of size k".
- Any start-index recursion with a **feasibility bound**: stop as soon as the remaining options cannot complete a solution.
- Combination Sum III: same tree plus a running sum and a sum bound.

## Pitfalls
- Without the bound the result is still correct, just slower; with a wrong bound you lose answers. `n − x + 1 < need` uses the count of numbers from `x` to `n` inclusive.
- Recurse with `x + 1`, not `start + 1`.
- Copy `path` when recording.

## Template
```python
def combine(n, k):
    res, path = [], []
    def bt(start):
        if len(path) == k:
            res.append(path[:]); return
        for x in range(start, n - (k - len(path)) + 2):   # bound folded into the range
            path.append(x); bt(x + 1); path.pop()
    bt(1)
    return res
```
