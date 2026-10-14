## Explanation
Summing every window of size `k` from scratch costs O(n·k). Neighbouring windows share `k − 1` elements, so instead **slide**: when the window moves one step right, add the element that enters and subtract the element that leaves. Each step is O(1), the whole scan O(n).

The same idea works for any aggregate you can update incrementally: a sum, a count of vowels, a frequency map of characters (anagram windows), a number of distinct values.

**Invariant:** `window` always equals the sum of `nums[right − k + 1 .. right]`.

## Complexity
| | Time | Space |
|---|---|---|
| Sliding window | O(n) | O(1) (O(alphabet) for count maps) |
| Recompute each window | O(n · k) | O(1) |

## When to use
- "Subarray / substring of length exactly k" — max/min sum, average, count of something, anagram of a pattern.
- When the window size is **not** fixed and depends on a condition, use the variable window (expand right, shrink left).
- For the window **maximum** (not sum), you need a monotonic deque — removing an element can't be undone with subtraction.

## Pitfalls
- `k > len(nums)` — there is no full window; decide what to return before slicing.
- Off-by-one when removing: the element leaving is `nums[right − k]`, not `nums[right − k + 1]`.
- Initialising `best = 0` fails when all sums are negative; initialise with the first window.

## Template
```python
win = sum(a[:k]); best = win
for r in range(k, len(a)):
    win += a[r] - a[r - k]
    best = max(best, win)
```
