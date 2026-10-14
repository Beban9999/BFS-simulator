## Explanation
Any two lines form a container whose area is `width × min(height)`. Checking all pairs is O(n²). Instead start with the **widest** container (both ends) and shrink.

Each step, the shorter wall is the bottleneck. Moving the *taller* wall inward can never help: the width shrinks and the height is still capped by the same short wall. So the short wall has already seen its best possible container — discard it and move that pointer. This greedy argument lets one pass find the maximum.

**Invariant:** every pair involving a discarded line has an area no larger than `best`.

## Complexity
| | Time | Space |
|---|---|---|
| Two pointers | O(n) | O(1) |
| All pairs | O(n²) | O(1) |

## When to use
- Maximise something that depends on a **pair** where one side is a bottleneck (min/max of the two) and the other factor is the distance between them.
- More generally: when you can prove one endpoint can never be part of a better answer, discard it and move on.

## Pitfalls
- Moving the taller wall (or both) skips the optimum.
- Equal heights: moving either side is fine — the area can't improve with either of them as the bottleneck.
- Confusing this with Trapping Rain Water, which sums water over every bar instead of picking two walls.

## Template
```python
l, r, best = 0, n - 1, 0
while l < r:
    best = max(best, (r - l) * min(h[l], h[r]))
    if h[l] < h[r]: l += 1
    else: r -= 1
```
