## Explanation
A **trie** stores strings character by character: every edge is one character, so the path from the root to a node spells a prefix. Words that share a prefix share that part of the path ("car", "cart" and "cat" share "ca"). A marker (`$` here, an `is_end` flag in many implementations) says that a node is the end of a complete word — "car" can be a word even though "cart" continues below it.

- **insert**: follow the word's characters from the root, creating missing children; mark the last node.
- **search**: follow the characters; the word is present only if the path exists **and** its last node is marked.
- **starts_with**: the path exists — no marker needed.
- **delete**: unmark the word's last node, then walk back up removing nodes that no longer lead anywhere (no marker, no children). Shared prefixes are kept.

**Invariant:** a string s is stored iff following s from the root succeeds and ends at a marked node.

## Complexity
| Operation | Time | Space |
|---|---|---|
| insert / search / prefix / delete | O(L), L = length of the string | insert adds ≤ L nodes |
| All words | — | O(total characters) worst case |

Independent of how many words are stored — unlike a hash set, a trie also answers prefix questions.

## When to use
- Prefix queries: autocomplete, "does any word start with…", search suggestions.
- Searching many words at once in a grid or text (Word Search II, Aho–Corasick).
- Bitwise tries (on 0/1 bits) for maximum-XOR problems.

## Pitfalls
- Forgetting the end marker: then "car" looks present after inserting only "cart".
- Deleting nodes that other words still use — only prune nodes with no children and no marker.
- Memory: a node per character; use dicts (sparse) rather than fixed arrays of 26 when the alphabet is large.

## Template
```python
class Trie:
    def __init__(self): self.root = {}
    def insert(self, w):
        n = self.root
        for c in w: n = n.setdefault(c, {})
        n["$"] = True
    def search(self, w):
        n = self.root
        for c in w:
            if c not in n: return False
            n = n[c]
        return "$" in n
```
