## Explanation
Backtracking is a depth-first walk of a decision tree that is never built in memory: each call is a node, each loop
iteration is an edge, and the shared `path` holds the choices from the root to the current node. Choosing changes the
shared state, the recursive call explores everything below that choice, and un-choosing restores the state so the
next sibling sees exactly what its parent saw.

**Invariant:** when `backtrack(state)` is entered and when it returns, `path` (and every other shared structure) holds
exactly the choices on the way from the root to this node.

## Complexity
| Problem | Nodes in the tree | Total time |
|---|---|---|
| Subsets of n | 2ⁿ | O(n · 2ⁿ) (copying each subset) |
| Permutations of n | about e · n! | O(n · n!) |
| Combinations n choose k | C(n, k) leaves | O(k · C(n, k)) |
| N-Queens | far fewer than nⁿ thanks to pruning | exponential |

Space: O(depth) for the recursion plus the output. Pruning doesn't change the worst case but often removes most of the tree.

## When to use
- "Return **all** subsets / permutations / combinations / partitions / placements."
- Constraint puzzles: place items so that no two conflict (queens, sudoku, colouring).
- Paths in a grid or graph that may not reuse a cell.
- n is small (roughly ≤ 15–20): the output itself is exponential.
- If the question asks only for a **count** or an **optimum** and subproblems repeat, try DP instead.

## Pitfalls
- Recording `path` instead of a copy (`path[:]` / `[...path]`): every saved answer ends up as the same empty list.
- Un-choose that doesn't mirror choose exactly (forgetting to clear `used[i]`, restore a grid cell or a set).
- Skipping duplicates with `i > 0` instead of `i > start` removes valid answers like `[1, 1]`.
- Forgetting to stop after the first success in "find one" problems explores the whole tree.
