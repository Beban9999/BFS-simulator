## Explanation
A partition cuts the string into consecutive pieces. Build it left to right: `backtrack(start)` decides where the **next piece** ends. Each `end` from `start + 1` to `len(s)` is a possible cut, but only if `s[start:end]` is a palindrome. Otherwise the branch is pruned immediately (greyed). For a valid piece, push it, recurse from `end`, and pop it afterwards.

When `start` reaches the end of the string, every character belongs to some palindromic piece, so `path` is a complete partition and is recorded. Each tree node is labelled with the piece it added.

The same "choose the next piece" shape solves Restore IP Addresses (pieces = valid octets) and Word Break II (pieces = dictionary words).

**Invariant:** `path` joined together equals `s[:start]`, and every piece in it is a palindrome.

## Complexity
| | Time | Space |
|---|---|---|
| length n | O(n · 2ⁿ) worst case (`"aaaa…"`: every cut is valid) | O(n) recursion + path |

Precomputing `is_pal[i][j]` with DP makes each check O(1) instead of O(n).

## When to use
- "All ways to split a string / array into pieces that satisfy X".
- Combine with memoisation when only a count or a minimum is needed (that is the DP version).

## Pitfalls
- Off-by-one on the slice: `end` runs up to `len(s)` **inclusive** so the last piece can be the rest of the string.
- Record a copy of `path`.
- Re-checking the same substrings is the main cost; cache `is_pal` for long inputs.

## Template
```python
def split_all(s, ok):
    res, path = [], []
    def bt(start):
        if start == len(s):
            res.append(path[:]); return
        for end in range(start + 1, len(s) + 1):
            if ok(s[start:end]):
                path.append(s[start:end]); bt(end); path.pop()
    bt(0)
    return res
```
