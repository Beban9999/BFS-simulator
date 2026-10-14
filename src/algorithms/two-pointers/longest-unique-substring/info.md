## Explanation
The variable-size sliding window keeps a **valid** window `s[left..right]` and moves both ends forward only:

1. **Expand:** move `right` one step and add `s[right]`.
2. **Shrink:** while the window breaks the rule (here: a repeated character), remove `s[left]` and move `left` forward.
3. **Record:** the window is valid again; update the best length.

Each index enters the window once and leaves at most once, so the total work is O(n) even with the inner `while`.

Optimisation: store the **last index** of each character in a map and jump `left` directly past the previous occurrence instead of shrinking one step at a time.

**Invariant:** after step 2, `s[left..right]` has no repeated characters, and it is the longest such window ending at `right`.

## Complexity
| | Time | Space |
|---|---|---|
| Set + shrink loop | O(n) (each char added/removed once) | O(min(n, alphabet)) |
| Last-index map (jumping) | O(n) | O(min(n, alphabet)) |
| Check all substrings | O(n²)–O(n³) | O(n) |

## When to use
- "Longest / shortest **contiguous** subarray or substring such that …" where the condition is monotonic: if a window is valid, every smaller window inside it is valid (longest), or if valid, every larger one is too (shortest).
- At most k distinct, at most k zeros flipped, sum ≥ target with positive numbers.

## Pitfalls
- Using `if` instead of `while` for the shrink step leaves duplicates in the window.
- With the jump optimisation, never move `left` backwards: `left = max(left, last[ch] + 1)`.
- Sliding windows need the monotonic property — sums with negative numbers break it (use prefix sums instead).

## Template
```python
left = 0
for right in range(len(s)):
    add(s[right])
    while not valid():
        remove(s[left]); left += 1
    best = max(best, right - left + 1)
```
