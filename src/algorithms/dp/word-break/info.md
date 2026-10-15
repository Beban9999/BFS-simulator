## Explanation
Can `s` be split into dictionary words? Let `dp[i]` say whether the **prefix of length `i`** can be. The empty prefix trivially can: `dp[0] = True`.

For a longer prefix, look at its **last word** `s[j:i]`. The prefix works if, for some split point `j`, the part before it works (`dp[j]`) **and** the last piece is a word:

`dp[i] = any(dp[j] and s[j:i] in words for j in 0..i−1)`

Columns are prefix lengths; the letters sit above the column where their prefix ends. For each `i`, the page shows the split points `j` with `dp[j] = True` (the arrows) and whether the remaining piece is a word. As soon as one works, `dp[i]` becomes True and the loop breaks.

**Invariant:** after column `i`, `dp[0..i]` say exactly which prefixes can be segmented.

## Complexity
| | Time | Space |
|---|---|---|
| n = len(s) | O(n²) splits × O(n) slicing/hashing = O(n³), or O(n² · L) if j only goes back L = longest word | O(n) |

## When to use
- "Can this sequence be cut into valid pieces?" — words, numbers, tokens.
- The same prefix-dp skeleton counts segmentations (sum instead of `any`), or finds the fewest pieces (min).
- A trie over the dictionary speeds up the inner loop for big dictionaries.

## Pitfalls
- Greedy longest-match fails: `"aaaaaaa"` with words `["aaaa", "aaa"]` needs 3 + 4, not 4 + 3.
- Put the words in a **set**: list lookups make every check O(|dict|).
- Off-by-one: `dp` has `n + 1` entries and `s[j:i]` excludes index `i`.

## Template
```python
def word_break(s, words):
    words = set(words)
    dp = [True] + [False] * len(s)
    for i in range(1, len(s) + 1):
        dp[i] = any(dp[j] and s[j:i] in words for j in range(i))
    return dp[-1]
```
