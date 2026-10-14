## Explanation
Many string and array problems only care about **how many times** each value appears, not where. A frequency map (Python `Counter`, a JS `Map`, or a fixed `int[26]` for lowercase letters) captures exactly that in one pass.

Two strings are anagrams when their letter counts are identical. Instead of building two maps and comparing them, count **up** for every letter of `s` and **down** for every letter of `t`. If the lengths match and no count ever drops below zero, every count ends at zero.

**Invariant:** after processing a prefix of `t`, `count[c]` is (copies of `c` in `s`) − (copies of `c` used so far in `t`); a negative value means `t` has a letter `s` cannot supply.

## Complexity
| | Time | Space |
|---|---|---|
| Hash map | O(n) | O(k) distinct characters |
| `int[26]` array | O(n) | O(1) |
| Sort both strings | O(n log n) | O(n) |

## When to use
- Anagrams, permutations of a string, "can X be built from Y" (ransom note).
- "Most / least frequent", "first unique", "top K frequent" — count first, then post-process.
- Sliding windows that compare character counts (Find All Anagrams, Minimum Window Substring).

## Pitfalls
- Forgetting the length check: `"ab"` vs `"a"` would otherwise pass the "no negative counts" test.
- Unicode: an `int[26]` table only works for lowercase ASCII letters.
- In Python, `Counter` subtraction drops non-positive counts — `Counter(s) - Counter(t)` being empty does not mean equality.

## Template
```python
from collections import Counter

def is_anagram(s, t):
    return len(s) == len(t) and Counter(s) == Counter(t)
```
