## Explanation
Instead of generating all 2^(2n) strings and filtering the valid ones, build the string one character at a time and **never** make a choice that cannot lead to a valid string:

- `"("` is allowed while fewer than n have been opened (`opened < n`);
- `")"` is allowed only when it closes something (`closed < opened`).

Each call **chooses** a character (push it onto `path`), **explores** the rest recursively, then **un-chooses** it (pop) so the other option can be tried from the same prefix. When `path` reaches length 2n, both rules guarantee it is balanced, so it is recorded without any check. `path` behaves exactly like a stack — and the recursion itself lives on the call stack.

This is the general backtracking template (choose → explore → un-choose); the Backtracking tab covers it in depth once it is built.

**Invariant:** at every call, `path` is a valid *prefix*: `closed ≤ opened ≤ n`.

## Complexity
| | Time | Space |
|---|---|---|
| Backtracking | O(4ⁿ / √n) — the n-th Catalan number of results, each of length 2n | O(n) recursion depth + path (output not counted) |

n = 1, 2, 3, 4, 5 give 1, 2, 5, 14, 42 strings.

## When to use
- "Generate all valid …" where validity can be checked **incrementally** on a prefix.
- Combinatorial search that needs pruning: N-Queens, Sudoku, word search, subsets / permutations with constraints.
- Problems whose answer count is a Catalan number (balanced strings, BST shapes, triangulations).

## Pitfalls
- Forgetting to pop after the recursive call (or using an immutable string, which avoids the pop at the cost of copies).
- Allowing `")"` when `closed == opened` produces invalid strings that then need filtering.
- Appending the `path` list itself to the results instead of a copy / joined string.

## Template
```python
def backtrack(state):
    if is_complete(state):
        results.append(snapshot(state)); return
    for choice in allowed_choices(state):
        apply(choice, state)
        backtrack(state)
        undo(choice, state)
```
