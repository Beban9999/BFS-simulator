## Explanation
Brackets nest: the bracket that closes must match the **most recently opened** bracket that is still open. "Most recent first" is exactly what a stack gives you (last in, first out).

Scan left to right. Push every opener. For every closer, look at the top of the stack: if it is the matching opener, pop it — that pair is done. If the stack is empty or the top is a different opener, the string is invalid immediately. At the end, anything left on the stack was opened but never closed, so the string is valid only if the stack is empty.

**Invariant:** after each character, the stack holds exactly the openers that are still unclosed, in the order they were opened (innermost on top).

## Complexity
| | Time | Space |
|---|---|---|
| Stack scan | O(n) | O(n) worst case (all openers) |
| One bracket type only | O(n) | O(1) — a depth counter replaces the stack |

## When to use
- Matching / nesting structure: brackets, HTML tags, nested function calls.
- Anything where the *latest* unfinished item must be finished first (undo, backtracking paths, expression parsing).
- Variants that store **indexes** on the stack to measure lengths or remove bad characters.

## Pitfalls
- Popping from an empty stack when the string starts with a closer — check emptiness first.
- Returning True at the end without checking that the stack is empty (`"(("`).
- With several bracket types a counter is not enough: `"(]"` has balanced counts but is invalid.
- An odd-length string can never be valid — a cheap early exit.

## Template
```python
def is_valid(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
        else:
            stack.append(ch)
    return not stack
```
