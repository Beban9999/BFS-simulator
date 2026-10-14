## Explanation
Find the shortest substring of `s` containing every character of `t` (with multiplicity). This is the "shortest valid window" form of the variable sliding window:

1. **Expand** `right` until the window covers `t`.
2. While it still covers `t`, record its length and **shrink** from the left — a shorter covering window might start further right.
3. As soon as removing a character breaks coverage, go back to expanding.

Checking "does the window cover `t`?" by comparing whole maps would be slow, so keep `formed`: the number of distinct letters of `t` whose required count is currently met. The window covers `t` exactly when `formed == required`.

**Invariant:** `formed` equals the number of letters `c` with `have[c] ≥ need[c]`; every index is added once and removed once.

## Complexity
| | Time | Space |
|---|---|---|
| Sliding window with `formed` | O(|s| + |t|) | O(alphabet) |
| Compare full maps each step | O(|s| · alphabet) | O(alphabet) |

## When to use
- "Smallest / shortest window that contains all of …" — characters, list ids, required items.
- Any minimum-length window where validity is monotonic: once valid, adding more keeps it valid.

## Pitfalls
- Incrementing `formed` on every matching character instead of only when the count **reaches** the requirement.
- Decrementing `formed` only when the count **drops below** the requirement (extra copies don't matter).
- `t` with repeated letters (`"aa"`) needs counts, not a set.

## Template
```python
for r, ch in enumerate(s):
    add(ch)
    while valid():
        best = min(best, r - l + 1)
        remove(s[l]); l += 1
```
