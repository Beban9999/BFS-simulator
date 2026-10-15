## Explanation
The best rectangle has the height of some bar `b`, and stretches left and right until the first bar **lower** than `b` on each side. So we need, for every bar, its nearest lower bar on the left and on the right — a monotonic stack gives both in one pass.

Keep the indexes of bars with **increasing** heights. When bar `i` arrives and is not taller than the top bar, the top bar can't extend past `i`: `i` is its right limit. Pop it; the bar now below it on the stack is its left limit (every bar between them was taller, which is why they were popped earlier). Its rectangle is `height × (i − left − 1)`. Keep popping while the top is at least as tall as `i`, then push `i`.

A sentinel bar of height 0 at position n pops everything that is left, so every bar gets evaluated.

**Invariant:** heights at the stack's indexes increase from bottom to top, and for each index on the stack, the index below it is its nearest lower bar on the left.

## Complexity
| | Time | Space |
|---|---|---|
| Monotonic stack | O(n) — each bar pushed and popped once | O(n) |
| Expand around every bar | O(n²) | O(1) |

## When to use
- "Largest rectangle / area" limited by the minimum height in a range.
- Any per-element question about the range where it is the minimum (or maximum): subarray minimum sums, max score `min × width`.
- 2D binary matrices via one histogram per row (maximal rectangle).

## Pitfalls
- Forgetting the sentinel (or a final flush loop) — bars still on the stack at the end are never evaluated.
- Width is `i − left − 1`, where `left` is the new top *after* popping (or −1 if the stack is empty).
- `>=` vs `>` when popping: both give the right answer; `>=` evaluates equal bars once at the rightmost copy.

## Template
```python
def largest_rectangle(h):
    st, best = [], 0
    for i, x in enumerate(h + [0]):
        while st and h[st[-1]] >= x:
            height = h[st.pop()]
            left = st[-1] if st else -1
            best = max(best, height * (i - left - 1))
        st.append(i)
    return best
```
