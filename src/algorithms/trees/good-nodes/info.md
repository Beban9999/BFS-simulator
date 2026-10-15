## Explanation
A node is **good** if no node on the path from the root to it has a larger value. Whether a node is good depends on its ancestors, so information must flow **down**; the total count flows back **up**.

Each call receives `best`, the largest value seen on the path above it. The node is good if `node.val >= best`. It then passes `max(best, node.val)` to both children and returns its own 1 or 0 plus the counts from its two subtrees. The root has nothing above it, so it starts with −∞ and is always good.

**Invariant:** `dfs(node, best)` returns the number of good nodes in node's subtree, given that `best` is the maximum on the path from the root to node's parent.

## Complexity
| | Time | Space |
|---|---|---|
| DFS with a parameter | O(n) | O(h) |

## When to use
- Conditions that depend on the whole root-to-node path: path max/min, ancestors' values, depth, "number built so far".
- Combine a top-down parameter with a bottom-up return value whenever a node needs both its ancestors' and its descendants' information.

## Pitfalls
- Using a global "max so far" instead of a parameter: sibling subtrees would see each other's values.
- `>=`, not `>`: a node equal to the path maximum is still good.
- Starting `best` at the root's value works too (the root is then good by `>=`), but −∞ makes the rule uniform.

## Template
```python
def good_nodes(root):
    def dfs(n, best):
        if not n: return 0
        g = n.val >= best
        best = max(best, n.val)
        return g + dfs(n.left, best) + dfs(n.right, best)
    return dfs(root, float("-inf"))
```
