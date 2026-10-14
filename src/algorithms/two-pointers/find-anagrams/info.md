## Explanation
An anagram of `p` is any arrangement of exactly the same letters, so a window of `s` is an anagram precisely when its **character counts** equal `p`'s counts. Every candidate window has length `len(p)`, which makes this a fixed-size sliding window over a frequency map.

Each step adds the entering character, removes the leaving one (once the window is full) and compares the two count tables. With a 26-letter alphabet the comparison is O(26) = O(1). A further optimisation tracks how many letters currently have matching counts, so the comparison becomes a single integer check.

**Invariant:** after processing `right`, `window` holds the counts of `s[max(0, right − k + 1) .. right]`.

## Complexity
| | Time | Space |
|---|---|---|
| Count arrays | O(n · 26) = O(n) | O(26) |
| Sort every window | O(n · k log k) | O(k) |

## When to use
- "Find all anagrams / permutations of `p` inside `s`", "does `s` contain a permutation of `p`".
- Any fixed-length window whose property depends only on **counts**, not order.

## Pitfalls
- Comparing before the window is full reports nothing wrong, but if you compare dicts make sure zero counts are deleted (`{a: 0}` ≠ `{}`).
- The window start is `right − k + 1`, not `right − k`.
- Uppercase / non-letter characters break the `ord(ch) − 97` indexing.

## Template
```python
need, win = Counter(p), Counter()
for r, ch in enumerate(s):
    win[ch] += 1
    if r >= k:
        win[s[r - k]] -= 1
        if win[s[r - k]] == 0: del win[s[r - k]]
    if win == need: out.append(r - k + 1)
```
