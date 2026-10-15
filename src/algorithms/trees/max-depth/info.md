## Explanation
The maximum depth (or height) of a tree is the number of nodes on the longest path from the root down to a leaf. Recursion makes this a one-liner: an empty tree has depth 0, and any other tree has depth `1 + max(depth(left), depth(right))` — the node itself plus its deeper subtree.

The work happens **after** both recursive calls return (postorder): each node waits for its children's answers, then combines them. The numbers under the nodes show what each call returned.

**Invariant:** when a call returns, its value is the exact depth of the subtree rooted at that node.

## Complexity
| | Time | Space |
|---|---|---|
| Recursive | O(n) | O(h) call stack |
| BFS (count levels) | O(n) | O(w) queue |

## When to use
- Any property of a subtree that can be built from the same property of its children: height, size, sum, min/max, "is balanced", diameter.
- The base pattern behind most "tree recursion" problems: return information upward.

## Pitfalls
- Base case returns 0 for `None` (counting nodes) — some problems count edges, so the answer is one less.
- Minimum depth is *not* the mirror image: `1 + min(left, right)` is wrong when one child is missing.
- Very deep skewed trees can hit the recursion limit; BFS avoids it.

## Template
```python
def solve(node):
    if node is None:
        return BASE
    left = solve(node.left)
    right = solve(node.right)
    return combine(node, left, right)
```
