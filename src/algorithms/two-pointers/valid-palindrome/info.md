## Explanation
A palindrome reads the same forwards and backwards, so the first character must equal the last, the second must equal the second-to-last, and so on. Two pointers walk inward from both ends comparing pairs; the first mismatch proves it is not a palindrome.

The interview twist is cleaning: ignore spaces and punctuation, and compare case-insensitively. Rather than building a cleaned copy (O(n) extra space), each pointer simply **skips** characters that don't count.

**Invariant:** every pair of alphanumeric characters outside `[left, right]` has already been checked and matched.

## Complexity
| | Time | Space |
|---|---|---|
| Two pointers with skipping | O(n) | O(1) |
| Clean + reverse + compare | O(n) | O(n) |

## When to use
- Palindrome checks on strings, numbers (digit by digit) or arrays.
- Anything symmetric: reversing in place, comparing mirrored positions.
- "Almost a palindrome" (delete one char): branch once on the first mismatch.

## Pitfalls
- Skipping on both sides in the same iteration can jump past a valid character; skip one side at a time.
- Forgetting case-folding (`'A'` vs `'a'`).
- Treating digits as junk — LeetCode 125 counts digits as alphanumeric.

## Template
```python
l, r = 0, len(s) - 1
while l < r:
    if s[l] != s[r]:
        return False
    l, r = l + 1, r - 1
return True
```
