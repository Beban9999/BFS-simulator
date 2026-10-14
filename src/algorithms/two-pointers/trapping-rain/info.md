## Explanation
Water sitting on bar `i` rises to the lower of the tallest bar on its left and the tallest bar on its right: `water[i] = min(maxLeft[i], maxRight[i]) − height[i]`. Computing both max arrays takes two extra passes and O(n) memory.

The two-pointer version needs O(1) memory. Keep `left_max` and `right_max` as running maxima from each end. If `height[left] < height[right]`, there is a wall on the right at least as tall as `height[left]`, so the right side is **not** the bottleneck for `left` — its water is decided by `left_max` alone. Settle `left` and move it. Otherwise settle `right` symmetrically.

**Invariant:** when a bar is settled, the smaller of its two maxima is already known exactly.

## Complexity
| | Time | Space |
|---|---|---|
| Two pointers | O(n) | O(1) |
| Prefix max + suffix max arrays | O(n) | O(n) |
| Monotonic stack | O(n) | O(n) |

## When to use
- Elevation maps / histograms where a value depends on the max (or min) to **both** sides.
- Any time you can settle the side whose bound is already known — the same reasoning as Container With Most Water.

## Pitfalls
- Comparing `left_max` with `right_max` vs `height[left]` with `height[right]`: both work if done consistently; mixing them breaks the argument.
- Adding negative water — update the max **before** subtracting the height.
- Arrays with fewer than 3 bars trap nothing.

## Template
```python
l, r, lm, rm, w = 0, n - 1, 0, 0, 0
while l < r:
    if h[l] < h[r]:
        lm = max(lm, h[l]); w += lm - h[l]; l += 1
    else:
        rm = max(rm, h[r]); w += rm - h[r]; r -= 1
```
