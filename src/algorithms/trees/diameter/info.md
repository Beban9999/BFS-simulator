## Explanation
The diameter is the number of edges on the longest path between any two nodes — and that path does not have to pass through the root. But every path has a single highest node where it **bends**: it goes down into the left subtree on one side and the right subtree on the other. The longest path bending at node `x` has length `height(left) + height(right)`.

So compute heights bottom-up as in max-depth, and at every node also update a global `best` with `left + right`. The function still **returns** `1 + max(left, right)` — a path coming up from below can continue through this node on one side only.

That "two different numbers" split — one value returned to the parent, another recorded as a candidate answer — is the key pattern of many tree problems.

**Invariant:** after `height(x)` returns, `best` is the diameter of the subtree rooted at x (or something larger found elsewhere).

## Complexity
| | Time | Space |
|---|---|---|
| One postorder pass | O(n) | O(h) |
| Height recomputed at every node | O(n²) worst case | O(h) |

## When to use
- Longest / best path *anywhere* in a tree (not just from the root).
- Problems where the answer at a node combines both children, but the parent can only use one of them.

## Pitfalls
- Returning `left + right` instead of `1 + max(left, right)` to the parent.
- Counting nodes instead of edges (off by one).
- Only checking the root's left + right — the longest path may sit entirely inside a subtree.

## Template
```python
def diameter(root):
    best = 0
    def h(n):
        nonlocal best
        if not n: return 0
        l, r = h(n.left), h(n.right)
        best = max(best, l + r)
        return 1 + max(l, r)
    h(root)
    return best
```
