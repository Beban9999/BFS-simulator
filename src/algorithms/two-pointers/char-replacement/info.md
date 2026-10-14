## Explanation
To turn a window into one repeated letter, keep its most frequent letter and change everything else. That costs `window length − max_freq` changes, so a window is fixable when that number is at most `k`.

Grow the window one character at a time, updating the letter counts and `max_freq`. If the window becomes unfixable, slide it: drop one character on the left. Because the window **never shrinks** below the best size found (it only grows or slides), its length at the end is the answer.

A neat subtlety: `max_freq` is never decreased when the left character leaves. A stale, too-high `max_freq` can only keep the window at its current size; it can never produce an answer larger than one that really existed, because the window only grows when a new real maximum appears.

**Invariant:** the window length never decreases, and `best` is the largest length of a fixable window seen so far.

## Complexity
| | Time | Space |
|---|---|---|
| Sliding window | O(n) | O(26) |
| Try every letter as the target | O(26 · n) | O(1) |

## When to use
- "Longest substring/subarray with at most k changes / k bad elements / k flips".
- A useful pattern: a "non-shrinking" window that slides (one in, one out) once it can't grow.

## Pitfalls
- Recomputing `max_freq` by scanning the counts every step works but is slower; it is not needed for correctness.
- Using `while` to shrink is fine but unnecessary here — one step of sliding always restores the size invariant.
- The answer can't exceed `len(s)`.

## Template
```python
for r, ch in enumerate(s):
    cnt[ch] += 1
    mx = max(mx, cnt[ch])
    if r - l + 1 - mx > k:
        cnt[s[l]] -= 1; l += 1
    best = max(best, r - l + 1)
```
