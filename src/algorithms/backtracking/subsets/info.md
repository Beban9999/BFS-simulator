## Explanation
Backtracking builds solutions one choice at a time: **choose** an option, **explore** what follows from it recursively, then **un-choose** it (pop) and try the next option. The calls form a **decision tree**: each node is a partial solution, and each edge is a choice.

For subsets, every node of that tree is itself an answer, so `backtrack` records `path` first. Then it tries each element at index `start` or later, which keeps elements in increasing index order so the same set is never built twice in another order. The root is the empty set; a node's children add one more, later element.

**Duplicates.** With `[1, 2, 2]`, choosing the first 2 or the second 2 as the next element leads to identical subtrees. After sorting, equal values sit next to each other, and the rule `i > start and nums[i] == nums[i-1]` skips a value that equals its **left sibling** in the same loop. The greyed node marks a branch that was cut. A 2 that is deeper in the path (e.g. `[2, 2]`) is still allowed, because it comes from a deeper call where `i == start`.

**Invariant:** `path` always lists chosen elements in increasing index order, and each distinct subset is recorded exactly once.

## Complexity
| | Time | Space |
|---|---|---|
| n elements | O(n · 2ⁿ) (2ⁿ subsets, copying each costs up to n) | O(n) recursion + path (output excluded) |

## When to use
- "Return all subsets / combinations / selections", typically with n ≤ 20.
- As a template: the start-index loop is the core of combinations, combination sum and subset-sum searches.
- Iterative alternatives: bitmasks `for mask in range(1 << n)`, or "copy every subset and append the new element".

## Pitfalls
- Append a **copy** (`path[:]`); appending `path` itself stores one list that ends up empty.
- Forgetting to sort before the duplicate check: equal values must be adjacent.
- `i > start` (not `i > 0`) in the skip test: only siblings are compared, not parent and child.
- Forgetting `path.pop()` leaks a choice into the next branch.

## Template
```python
def backtrack(start, path):
    record(path[:])                      # every node is an answer
    for i in range(start, len(options)):
        if i > start and options[i] == options[i - 1]:
            continue                     # skip duplicate siblings (sorted input)
        path.append(options[i])          # choose
        backtrack(i + 1, path)           # explore
        path.pop()                       # un-choose
```
