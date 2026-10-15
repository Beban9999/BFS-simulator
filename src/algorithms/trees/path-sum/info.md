## Explanation
Root-to-leaf problems pass information **down** the tree (top-down), the opposite of height-style recursion. Each call receives the target that is still `remaining` after the nodes above it, subtracts its own value, and passes the rest to its children.

The current path lives in a list used as a stack: push the node when entering, and pop it just before returning (**backtracking**), so the list always equals the path from the root to the current node. At a **leaf** (no children), if the remainder is exactly 0, the path sums to the target — record a **copy** of it.

Note that "leaf" matters: a node with one child is not the end of a root-to-leaf path.

**Invariant:** inside `dfs(node, remaining)`, `path` holds the values from the root down to `node`'s parent, and `remaining = target − sum(path)`.

## Complexity
| | Time | Space |
|---|---|---|
| Yes/no (Path Sum) | O(n) | O(h) |
| All paths (Path Sum II) | O(n · h) — copying each found path | O(h) + output |

## When to use
- Any root-to-leaf question: path sums, path strings, max/min along a path, "good" nodes.
- Problems where a parent's information is needed by its children (depth, path max, remaining budget).

## Pitfalls
- Appending `path` itself instead of a copy — every recorded path later becomes empty.
- Forgetting `path.pop()` (or popping in only one branch).
- Checking `remaining == 0` at a non-leaf node, or at `None` (then each leaf would be counted twice).
- Pruning on `remaining < 0` is wrong when values can be negative.

## Template
```python
def paths(root, target):
    res, path = [], []
    def dfs(n, rem):
        if not n: return
        path.append(n.val); rem -= n.val
        if not n.left and not n.right and rem == 0:
            res.append(path[:])
        dfs(n.left, rem); dfs(n.right, rem)
        path.pop()
    dfs(root, target)
    return res
```
